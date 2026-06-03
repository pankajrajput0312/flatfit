import uuid
from datetime import date, timedelta
from zoneinfo import ZoneInfo
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_
from redis.asyncio import Redis

from app.modules.metrics.models import MetricLog, UserMetricConfig, MetricType, MANDATORY_METRICS, METRIC_POINTS
from app.modules.metrics.schemas import MetricLogCreate, MetricConfigCreate, DailySummaryResponse
from app.core.exceptions import ConflictException, ResourceNotFoundException

IST = ZoneInfo("Asia/Kolkata")


def _get_ist_today() -> date:
    """Returns the current calendar date in IST timezone."""
    from datetime import datetime
    return datetime.now(IST).date()


class MetricService:

    # ==================================================================
    # CONFIGURATION
    # ==================================================================

    @staticmethod
    async def configure_metric(db: AsyncSession, user_id: uuid.UUID, payload: MetricConfigCreate) -> UserMetricConfig:
        """
        Creates or updates a user's daily target for a metric (upsert pattern).
        """
        result = await db.execute(
            select(UserMetricConfig)
            .where(UserMetricConfig.user_id == user_id)
            .where(UserMetricConfig.metric_type == payload.metric_type)
        )
        config = result.scalars().first()

        if config:
            # Update existing config
            config.daily_target = payload.daily_target
            config.is_active = payload.is_active
        else:
            # Create new config
            config = UserMetricConfig(
                user_id=user_id,
                metric_type=payload.metric_type,
                daily_target=payload.daily_target,
                is_active=payload.is_active,
            )
            db.add(config)

        await db.commit()
        await db.refresh(config)
        return config

    @staticmethod
    async def get_user_configs(db: AsyncSession, user_id: uuid.UUID) -> list[UserMetricConfig]:
        """Returns all active metric configurations for a user."""
        result = await db.execute(
            select(UserMetricConfig)
            .where(UserMetricConfig.user_id == user_id)
            .where(UserMetricConfig.is_active == True)
        )
        return list(result.scalars().all())

    # ==================================================================
    # LOGGING
    # ==================================================================

    @staticmethod
    async def log_metric(
        db: AsyncSession,
        redis_client: Redis,
        user_id: uuid.UUID,
        payload: MetricLogCreate
    ) -> MetricLog:
        """
        Core metric logging pipeline:
        1. Resolves the log date (defaults to IST today).
        2. Calculates the cumulative total for this metric today.
        3. Detects if the daily goal was just crossed for the first time.
        4. Awards points and updates Redis leaderboard atomically.
        5. Commits to the immutable ledger.
        """
        log_date = payload.log_date or _get_ist_today()

        # Step 1: Fetch the user's daily target for this metric
        config_result = await db.execute(
            select(UserMetricConfig)
            .where(UserMetricConfig.user_id == user_id)
            .where(UserMetricConfig.metric_type == payload.metric_type)
            .where(UserMetricConfig.is_active == True)
        )
        config = config_result.scalars().first()
        if not config:
            raise ResourceNotFoundException(
                f"No active configuration found for metric '{payload.metric_type.value}'. "
                "Please configure your daily target first."
            )

        # Step 2: Check if goal was already met today (prevents double-awarding points)
        already_met_result = await db.execute(
            select(MetricLog)
            .where(MetricLog.user_id == user_id)
            .where(MetricLog.metric_type == payload.metric_type)
            .where(MetricLog.log_date == log_date)
            .where(MetricLog.goal_met == True)
        )
        goal_already_met = already_met_result.scalars().first() is not None

        # Step 3: Calculate cumulative total for today
        cumulative_result = await db.execute(
            select(func.coalesce(func.sum(MetricLog.value), 0.0))
            .where(MetricLog.user_id == user_id)
            .where(MetricLog.metric_type == payload.metric_type)
            .where(MetricLog.log_date == log_date)
        )
        cumulative_total = float(cumulative_result.scalar())
        new_total = cumulative_total + payload.value

        # Step 4: Determine if THIS log entry crosses the goal threshold
        goal_now_met = (not goal_already_met) and (new_total >= config.daily_target)
        
        # Step 5: Calculate points to award
        points_awarded = 0
        if goal_now_met and payload.metric_type in MANDATORY_METRICS:
            points_awarded = METRIC_POINTS[payload.metric_type]

        # Step 6: Create the immutable ledger entry
        new_log = MetricLog(
            user_id=user_id,
            metric_type=payload.metric_type,
            value=payload.value,
            log_date=log_date,
            goal_met=goal_now_met,
            points_awarded=points_awarded,
        )
        db.add(new_log)
        await db.commit()
        await db.refresh(new_log)

        # Step 7: If points were awarded, update ALL Redis leaderboard windows atomically
        if points_awarded > 0:
            await MetricService._update_leaderboards(redis_client, user_id, points_awarded, log_date)

        return new_log

    @staticmethod
    async def _update_leaderboards(redis_client: Redis, user_id: uuid.UUID, points: int, log_date: date):
        """
        Increments the user's score in all three active leaderboard windows (day/week/month).
        Uses Redis ZINCRBY which is a single atomic O(log N) operation.
        """
        user_id_str = str(user_id)

        # Daily key: leaderboard:global:daily:2026-06-03
        daily_key = f"leaderboard:global:daily:{log_date.isoformat()}"

        # Weekly key uses ISO week: leaderboard:global:weekly:2026-W22
        weekly_key = f"leaderboard:global:weekly:{log_date.strftime('%Y-W%W')}"

        # Monthly key: leaderboard:global:monthly:2026-06
        monthly_key = f"leaderboard:global:monthly:{log_date.strftime('%Y-%m')}"

        # Fire all three increments concurrently using a pipeline for efficiency
        async with redis_client.pipeline(transaction=True) as pipe:
            pipe.zincrby(daily_key, points, user_id_str)
            pipe.zincrby(weekly_key, points, user_id_str)
            pipe.zincrby(monthly_key, points, user_id_str)
            await pipe.execute()

    # ==================================================================
    # DAILY SUMMARY (Dashboard)
    # ==================================================================

    @staticmethod
    async def get_daily_summary(db: AsyncSession, user_id: uuid.UUID, target_date: date = None) -> list[DailySummaryResponse]:
        """
        Returns aggregated progress for each active metric on a given day.
        Powers the dashboard progress rings.
        """
        target_date = target_date or _get_ist_today()

        configs = await MetricService.get_user_configs(db, user_id)
        summaries = []

        for config in configs:
            # Sum all log entries for this metric today
            total_result = await db.execute(
                select(func.coalesce(func.sum(MetricLog.value), 0.0))
                .where(MetricLog.user_id == user_id)
                .where(MetricLog.metric_type == config.metric_type)
                .where(MetricLog.log_date == target_date)
            )
            total_logged = float(total_result.scalar())

            # Total points earned for this metric today
            points_result = await db.execute(
                select(func.coalesce(func.sum(MetricLog.points_awarded), 0))
                .where(MetricLog.user_id == user_id)
                .where(MetricLog.metric_type == config.metric_type)
                .where(MetricLog.log_date == target_date)
            )
            total_points = int(points_result.scalar())

            goal_met = total_logged >= config.daily_target
            progress_percent = min(round((total_logged / config.daily_target) * 100, 1), 100.0)

            summaries.append(DailySummaryResponse(
                log_date=target_date,
                metric_type=config.metric_type,
                daily_target=config.daily_target,
                total_logged=total_logged,
                goal_met=goal_met,
                points_awarded=total_points,
                progress_percent=progress_percent,
            ))

        return summaries

    # ==================================================================
    # STREAK ENGINE
    # ==================================================================

    @staticmethod
    async def get_streak(db: AsyncSession, user_id: uuid.UUID) -> dict:
        """
        Computes current and longest streak.
        A day "counts" if ALL mandatory metrics (workout, protein, water) had goal_met=True.
        """
        # Fetch all dates where all mandatory metrics were met
        # We find dates where count of distinct goal_met mandatory metrics == len(MANDATORY_METRICS)
        mandatory_types = [m.value for m in MANDATORY_METRICS]

        result = await db.execute(
            select(MetricLog.log_date)
            .where(MetricLog.user_id == user_id)
            .where(MetricLog.metric_type.in_(mandatory_types))
            .where(MetricLog.goal_met == True)
            .group_by(MetricLog.log_date)
            .having(func.count(func.distinct(MetricLog.metric_type)) == len(MANDATORY_METRICS))
            .order_by(MetricLog.log_date.desc())
        )
        active_dates = [row[0] for row in result.fetchall()]

        if not active_dates:
            return {"current_streak": 0, "longest_streak": 0, "last_active_date": None}

        # Calculate current streak (consecutive days ending at today or yesterday)
        today = _get_ist_today()
        current_streak = 0
        expected_date = today

        for active_date in active_dates:
            if active_date == expected_date or active_date == expected_date - timedelta(days=1):
                current_streak += 1
                expected_date = active_date - timedelta(days=1)
            else:
                break

        # If most recent active date is neither today nor yesterday, streak is broken
        if active_dates[0] < today - timedelta(days=1):
            current_streak = 0

        # Calculate longest streak (sliding window over sorted dates)
        longest_streak = 0
        streak = 1
        sorted_dates = sorted(active_dates)

        for i in range(1, len(sorted_dates)):
            if sorted_dates[i] - sorted_dates[i - 1] == timedelta(days=1):
                streak += 1
                longest_streak = max(longest_streak, streak)
            else:
                streak = 1

        longest_streak = max(longest_streak, streak, current_streak)

        return {
            "current_streak": current_streak,
            "longest_streak": longest_streak,
            "last_active_date": active_dates[0],
        }
