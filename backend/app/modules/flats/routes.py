import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from redis.asyncio import Redis

from app.core.database import get_db
from app.core.redis_pool import get_redis
from app.modules.flats.schemas import FlatCreate, FlatJoin, FlatResponse, FlatInviteResponse
from app.modules.flats.services import FlatService
from app.modules.auth.models import User
from app.core.dependencies import get_current_user

router = APIRouter(
    prefix="/flats",
    tags=["Flats"]
)

@router.post(
    "/",
    response_model=FlatResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new Flat (Group)"
)
async def create_flat(
    payload: FlatCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Creates a new fitness group. The requesting user becomes the admin automatically.
    """
    flat = await FlatService.create_flat(db, payload, current_user.id)
    return flat


@router.post(
    "/join",
    response_model=FlatResponse,
    status_code=status.HTTP_200_OK,
    summary="Join a Flat using an invite code"
)
async def join_flat(
    payload: FlatJoin,
    db: AsyncSession = Depends(get_db),
    redis_client: Redis = Depends(get_redis),
    current_user: User = Depends(get_current_user)
):
    """
    Consumes a 24-hour invite code from Redis to join a group.
    """
    flat = await FlatService.join_flat_via_code(db, redis_client, payload.invite_code, current_user.id)
    return flat


@router.get(
    "/",
    response_model=list[FlatResponse],
    status_code=status.HTTP_200_OK,
    summary="Get all Flats the current user belongs to"
)
async def get_my_flats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns all groups the authenticated user is a member of.
    """
    flats = await FlatService.get_user_flats(db, current_user.id)
    return flats


@router.post(
    "/{flat_id}/invite",
    response_model=FlatInviteResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate a 24-hour invite code (Admin only)"
)
async def generate_invite(
    flat_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    redis_client: Redis = Depends(get_redis),
    current_user: User = Depends(get_current_user)
):
    """
    Admin-only endpoint. Generates a short-lived invite code stored in Redis.
    """
    invite_code, ttl = await FlatService.generate_invite_code(db, redis_client, flat_id, current_user.id)
    return {
        "invite_code": invite_code,
        "expires_in_seconds": ttl,
        "flat_id": flat_id
    }
