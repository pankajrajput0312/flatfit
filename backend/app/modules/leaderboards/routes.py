import uuid
from typing import Literal
from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from redis.asyncio import Redis
from fastapi import HTTPException

from app.core.database import get_db
from app.core.redis_pool import get_redis
from app.core.dependencies import get_current_user
from app.modules.auth.models import User
from app.modules.leaderboards.schemas import LeaderboardResponse
from app.modules.leaderboards.services import LeaderboardService

router = APIRouter(
    prefix="/leaderboards",
    tags=["Leaderboards"]
)

@router.get(
    "/global",
    response_model=LeaderboardResponse,
    summary="Get Global Leaderboard"
)
async def get_global_leaderboard(
    timeframe: Literal["daily", "weekly", "monthly"] = Query(..., description="The time window for the leaderboard"),
    target_date: date = Query(None, description="Format: YYYY-MM-DD. Defaults to today's IST date."),
    limit: int = Query(10, ge=1, le=100, description="Number of top users to return (max 100)"),
    db: AsyncSession = Depends(get_db),
    redis_client: Redis = Depends(get_redis),
    current_user: User = Depends(get_current_user)
):
    """
    Returns the top X globally ranked users for a specific timeframe.
    Also returns the current user's specific rank and score, even if they aren't in the top X.
    """
    board = await LeaderboardService.get_global_leaderboard(
        db, redis_client, current_user.id, timeframe, target_date, limit
    )
    return board


@router.get(
    "/flats/{flat_id}",
    response_model=LeaderboardResponse,
    summary="Get Group (Flat) Leaderboard"
)
async def get_flat_leaderboard(
    flat_id: uuid.UUID,
    timeframe: Literal["daily", "weekly", "monthly"] = Query(..., description="The time window for the leaderboard"),
    target_date: date = Query(None, description="Format: YYYY-MM-DD. Defaults to today's IST date."),
    db: AsyncSession = Depends(get_db),
    redis_client: Redis = Depends(get_redis),
    current_user: User = Depends(get_current_user)
):
    """
    Returns the complete leaderboard for a specific Flat.
    The requesting user must be a member of the Flat.
    """
    try:
        board = await LeaderboardService.get_flat_leaderboard(
            db, redis_client, current_user.id, flat_id, timeframe, target_date
        )
        return board
    except ValueError as e:
        # FlatService threw a ValueError because the user wasn't in the flat
        raise HTTPException(status_code=403, detail=str(e))
