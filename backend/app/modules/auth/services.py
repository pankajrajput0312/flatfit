from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.modules.auth.models import User
from app.modules.auth.schemas import UserRegistration, UserLogin
from app.core import security
from app.core.exceptions import ConflictException, AuthenticationFailedException, ResourceNotFoundException

class AuthService:
    """
    Encapsulates all business logic for Authentication.
    We isolate this from the FastAPI routes to make this highly testable.
    """

    @staticmethod
    async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
        """Looks up a user by email."""
        result = await db.execute(select(User).where(User.email == email))
        return result.scalars().first()

    @staticmethod
    async def register_new_user(db: AsyncSession, payload: UserRegistration) -> User:
        """
        Handles the secure registration flow.
        """
        # 1. Prevent overlapping emails
        existing_user = await AuthService.get_user_by_email(db, payload.email)
        if existing_user:
            raise ConflictException("An account with this email is already registered")

        # 2. Hash password utilizing core configuration (Argon2id)
        hashed_pw = security.get_password_hash(payload.password)

        # 3. Build & persist entity
        new_user = User(
            email=payload.email,
            full_name=payload.full_name,
            hashed_password=hashed_pw
        )
        
        db.add(new_user)
        # 4. Commit synchronously handles any pending constraints from Postgres level
        await db.commit()
        await db.refresh(new_user)
        return new_user

    @staticmethod
    async def authenticate_user(db: AsyncSession, payload: UserLogin) -> User:
        """
        Core login verification.
        """
        user = await AuthService.get_user_by_email(db, payload.email)
        
        # 1. Broadly deny access if email is wrong, password is wrong, or user is banned.
        # We don't specify *which* one is wrong to avoid credential enumeration.
        if not user or not user.is_active:
            raise AuthenticationFailedException("Invalid email or password")
            
        if not security.verify_password(payload.password, user.hashed_password):
            raise AuthenticationFailedException("Invalid email or password")
            
        return user
