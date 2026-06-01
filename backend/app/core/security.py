from datetime import datetime, timedelta, timezone
from typing import Any, Union
import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from app.config import get_settings

settings = get_settings()

# We use the raw Argon2id PasswordHasher to avoid outdated passlib bcrypt compatibility issues.
# Argon2 is currently the OWASP recommended hashing algorithm for password storage.
ph = PasswordHasher()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Validates a plaintext password against a stored Argon2id hash.
    Returns True if valid, False otherwise.
    """
    try:
        ph.verify(hashed_password, plain_password)
        # Optional: check if the hash needs recompiling based on new security parameters
        if ph.check_needs_rehash(hashed_password):
            pass # In a full system, you would schedule a background task here to rehash and save.
        return True
    except VerifyMismatchError:
        return False

def get_password_hash(password: str) -> str:
    """
    Generates a secure Argon2id hash for a plaintext password.
    """
    return ph.hash(password)

def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    """
    Constructs a JSON Web Token (JWT) for authentication. 
    Subject is typically the User ID.
    Enforces expiration to mitigate token hijacking.
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject), "type": "access"}
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def create_refresh_token(subject: Union[str, Any]) -> str:
    """
    Constructs a long-lived JSON Web Token (JWT) intended only for 
    refreshing expired access tokens.
    """
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {"exp": expire, "sub": str(subject), "type": "refresh"}
    # Note: Using a dedicated refresh secret key for added security isolation
    encoded_jwt = jwt.encode(to_encode, settings.JWT_REFRESH_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt
