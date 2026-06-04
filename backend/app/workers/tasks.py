import asyncio
import uuid
import logging
from datetime import timedelta
from zoneinfo import ZoneInfo
from celery import shared_task

from sqlalchemy.future import select
from app.workers.celery_app import celery
from app.core.database import AsyncSessionLocal
from app.core.redis_pool import RedisPool
from app.modules.leaderboards.models import HistoricalLeaderboard

IST = ZoneInfo("Asia/Kolkata")
logger = logging.getLogger(__name__)

async def _run_archive_yesterday():
    """
    Async logic to fetch yesterday's leaderboards from Redis,
    save them to Postgres, and delete the Redis keys.
    """
    from datetime import datetime
    yesterday_date = datetime.now(IST).date() - timedelta(days=1)
    
    # Generate the exact keys for yesterday
    daily_key = f"leaderboard:global:daily:{yesterday_date.isoformat()}"
    weekly_key = f"leaderboard:global:weekly:{yesterday_date.strftime('%Y-W%W')}"
    monthly_key = f"leaderboard:global:monthly:{yesterday_date.strftime('%Y-%m')}"
    
    redis_client = await RedisPool.get_client()
    
    try:
        # Fetch the complete leaderboards from Redis
        daily_board = await redis_client.zrevrange(daily_key, 0, -1, withscores=True)
        weekly_board = await redis_client.zrevrange(weekly_key, 0, -1, withscores=True)
        monthly_board = await redis_client.zrevrange(monthly_key, 0, -1, withscores=True)

        async with AsyncSessionLocal() as session:
            try:
                # 1. Process Daily Leaderboard
                if daily_board:
                    for rank_idx, (uid_str, score) in enumerate(daily_board):
                        session.add(HistoricalLeaderboard(
                            user_id=uuid.UUID(uid_str),
                            timeframe="daily",
                            leaderboard_date=yesterday_date.isoformat(),
                            points=int(score),
                            rank=rank_idx + 1
                        ))
                
                # 2. Process Weekly Leaderboard (only if yesterday was Sunday, i.e end of week)
                if weekly_board and yesterday_date.weekday() == 6:  # 6 is Sunday
                    w_str = yesterday_date.strftime('%Y-W%W')
                    for rank_idx, (uid_str, score) in enumerate(weekly_board):
                        session.add(HistoricalLeaderboard(
                            user_id=uuid.UUID(uid_str),
                            timeframe="weekly",
                            leaderboard_date=w_str,
                            points=int(score),
                            rank=rank_idx + 1
                        ))
                
                # 3. Process Monthly Leaderboard (only if yesterday was last day of month)
                next_day = yesterday_date + timedelta(days=1)
                if monthly_board and next_day.day == 1:
                    m_str = yesterday_date.strftime('%Y-%m')
                    for rank_idx, (uid_str, score) in enumerate(monthly_board):
                        session.add(HistoricalLeaderboard(
                            user_id=uuid.UUID(uid_str),
                            timeframe="monthly",
                            leaderboard_date=m_str,
                            points=int(score),
                            rank=rank_idx + 1
                        ))

                await session.commit()
                
                # Finally, pipeline delete the Redis keys we archived
                keys_to_delete = [daily_key]
                if yesterday_date.weekday() == 6:
                    keys_to_delete.append(weekly_key)
                if next_day.day == 1:
                    keys_to_delete.append(monthly_key)
                    
                await redis_client.delete(*keys_to_delete)
                logger.info(f"Successfully archived leaderboards for {yesterday_date.isoformat()} and cleared {len(keys_to_delete)} Redis keys.")
                
            except Exception as e:
                await session.rollback()
                logger.error(f"Failed to archive leaderboard: {e}")
                raise
    finally:
        await redis_client.close()


@celery.task(name="app.workers.tasks.archive_yesterday_leaderboard")
def archive_yesterday_leaderboard():
    """
    Celery task wrapper that executes the async archival logic.
    Triggered by Celery Beat every day at 12:01 AM IST.
    """
    logger.info("Starting nightly leaderboard archival...")
    asyncio.run(_run_archive_yesterday())
    logger.info("Nightly archival job finished.")
