from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core import security
from app.modules.auth.schemas import UserRegistration, UserLogin, UserResponse, Token
from app.modules.auth.services import AuthService

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post(
    "/register", 
    response_model=UserResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account"
)
async def register(
    payload: UserRegistration, 
    db: AsyncSession = Depends(get_db)
):
    """
    Consumer endpoint for creating a new profile.
    Automatically prevents duplicate emails and validates password strength payloads.
    """
    new_user = await AuthService.register_new_user(db, payload)
    return new_user


@router.post(
    "/login", 
    response_model=Token, 
    status_code=status.HTTP_200_OK,
    summary="Obtain JWT auth tokens"
)
async def login(
    payload: UserLogin, 
    db: AsyncSession = Depends(get_db)
):
    """
    Grants short-lived access tokens and long-lived refresh tokens upon 
    successful Argon2id credential verification.
    """
    # 1. Verify credentials via Service layer
    user = await AuthService.authenticate_user(db, payload)
    
    # 2. Issue Token Set
    access_token = security.create_access_token(subject=user.id)
    refresh_token = security.create_refresh_token(subject=user.id)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }
