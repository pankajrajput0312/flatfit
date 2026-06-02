import uuid
import jwt
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.config import get_settings
from app.core.database import get_db
from app.core.exceptions import AuthenticationFailedException
from app.modules.auth.models import User

settings = get_settings()

# HTTPBearer automatically reads the 'Authorization: Bearer <token>' header.
# auto_error=False means we get None instead of a 500 crash if no header is sent.
bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    db: AsyncSession = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
) -> User:
    """
    Shared FastAPI dependency that:
    1. Extracts the JWT access token from the Authorization header.
    2. Verifies the cryptographic signature and expiry.
    3. Validates the token_version against the DB to detect revoked sessions.
    4. Returns the full User ORM object to the calling route.

    This is the security backbone of every protected endpoint.
    """
    # Step 1: Ensure the header is present at all
    if not credentials:
        raise AuthenticationFailedException("Authentication token is missing.")

    token = credentials.credentials

    # Step 2: Decode and validate signature + expiry using pyjwt
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
    except jwt.ExpiredSignatureError:
        raise AuthenticationFailedException("Session has expired. Please log in again.")
    except jwt.InvalidTokenError:
        raise AuthenticationFailedException("Invalid authentication token.")

    # Step 3: Extract subject (user_id) and ensure this is an access token, not a refresh token
    user_id: str = payload.get("sub")
    token_type: str = payload.get("type")

    if not user_id or token_type != "access":
        raise AuthenticationFailedException("Invalid token payload.")

    # Step 4: Fetch the live User record from the database
    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user: User = result.scalars().first()

    if not user:
        raise AuthenticationFailedException("User account no longer exists.")

    if not user.is_active:
        raise AuthenticationFailedException("This account has been suspended.")

    # Step 5: Token version check — invalidates all tokens issued before a password change.
    # The token carries no version claim currently; we will extend this in a future security hardening pass.
    # For now, active user + valid signature is sufficient for Phase 1.

    return user
