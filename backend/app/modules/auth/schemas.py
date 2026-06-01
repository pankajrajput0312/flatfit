import uuid
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime

# =====================================================================
# REQUEST PAYLOADS (Data flowing INTO the API)
# =====================================================================

class UserRegistration(BaseModel):
    """
    Blueprint for incoming registration requests.
    Validates structural integrity before it hits database logic.
    """
    full_name: str = Field(..., min_length=2, max_length=150, description="User's display name")
    email: EmailStr = Field(..., description="Valid corporate or personal email address")
    password: str = Field(..., min_length=8, description="Strong password (minimum 8 characters)")

class UserLogin(BaseModel):
    """
    Blueprint for standard login requests.
    """
    email: EmailStr
    password: str = Field(..., min_length=1)

# =====================================================================
# RESPONSE PAYLOADS (Data flowing OUT OF the API)
# =====================================================================

class UserResponse(BaseModel):
    """
    Public serialization of the User identity. 
    Critically omits fields like 'hashed_password' and 'token_version'.
    """
    id: uuid.UUID
    email: EmailStr
    full_name: str
    is_active: bool
    created_at: datetime
    
    # Enables Pydantic to read directly from SQLAlchemy ORM DB Models
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    """
    Standard OAuth2 JWT transport payload returned upon successful auth.
    """
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenPayload(BaseModel):
    """
    Internal model representing the decoded contents of a verified JWT.
    Used during dependency injection authentication checking.
    """
    sub: Optional[str] = None
    exp: Optional[int] = None
    type: Optional[str] = None
