from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from redis.asyncio import Redis
from datetime import date
from typing import Optional

from app.core.database import get_db
from app.core.redis_pool import get_redis
from app.core.dependencies import get_current_user
from app.modules.auth.models import User
from app.modules.metrics.schemas import (
    MetricConfigCreate, 
    MetricConfigResponse,
    MetricLogCreate,
    MetricLogResponse,
    DailySummaryResponse,
    StreakResponse
)
from app.modules.metrics.services import MetricService

router = APIRouter(
    prefix="/metrics",
    tags=["Metrics"]
)

# =====================================================================
# CONFIGURATION
# =====================================================================

@router.get(
    "/configs",
    response_model=list[MetricConfigResponse],
    summary="Get all metric configurations for the current user"
)
async def get_my_configs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns the user's active daily targets for all enabled metrics.
    """
    configs = await MetricService.get_user_configs(db, current_user.id)
    return configs

@router.post(
    "/configs",
    response_model=MetricConfigResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Set or update a daily target for a metric"
)
async def configure_metric(
    payload: MetricConfigCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Creates or updates the configuration representing the user's daily goal.
    For example: 3000(ml) for WATER, 150(g) for PROTEIN.
    """
    config = await MetricService.configure_metric(db, current_user.id, payload)
    return config

# =====================================================================
# LOGGING
# =====================================================================

@router.post(
    "/logs",
    response_model=MetricLogResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Log a metric progress value"
)
async def log_metric(
    payload: MetricLogCreate,
    db: AsyncSession = Depends(get_db),
    redis_client: Redis = Depends(get_redis),
    current_user: User = Depends(get_current_user)
):
    """
    Appends a new value to the immutable metric ledger.
    If this pushes the total cumulative value past the daily target,
    it automatically awards points and syncs the Redis leaderboards.
    """
    new_log = await MetricService.log_metric(db, redis_client, current_user.id, payload)
    return new_log

# =====================================================================
# AGGREGATIONS
# =====================================================================

@router.get(
    "/summary",
    response_model=list[DailySummaryResponse],
    summary="Get aggregated daily progress"
)
async def get_daily_summary(
    target_date: Optional[date] = Query(None, description="Format: YYYY-MM-DD. Defaults to today's IST date."),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns the total logged value, goal status, and completion percentage 
    for all active metrics on a specific date. Powers dashboard UI rings.
    """
    summary = await MetricService.get_daily_summary(db, current_user.id, target_date)
    return summary

@router.get(
    "/streak",
    response_model=StreakResponse,
    summary="Get user streak data"
)
async def get_user_streak(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Calculates the current consecutive streak (days where all mandatory goals were met),
    the all-time longest streak, and the last active day.
    """
    streak_data = await MetricService.get_streak(db, current_user.id)
    return streak_data
