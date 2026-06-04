import uuid
from typing import Literal
from datetime import date
from zoneinfo import ZoneInfo
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from redis.asyncio import Redis

from app.modules.auth.models import User
from app.modules.flats.models import FlatMember
from app.modules.leaderboards.models import HistoricalLeaderboard
from app.modules.leaderboards.schemas import LeaderboardUser, LeaderboardResponse

IST = ZoneInfo("Asia/Kolkata")

def _get_ist_today() -> date:
    from datetime import datetime
    return datetime.now(IST).date()


class LeaderboardService:
    """
    Service responsible for constructing leaderboards by intersecting
    high-speed Redis ZSET scores with PostgreSQL user metadata.
    """

    @staticmethod
    def _build_redis_key(timeframe: Literal["daily", "weekly", "monthly"], target_date: date = None) -> str:
        """
        Dynamically calculates the exact Redis ZSET key string based on 
        the requested timeframe window.
        """
        d = target_date or _get_ist_today()
        if timeframe == "daily":
            return f"leaderboard:global:daily:{d.isoformat()}"
        elif timeframe == "weekly":
            return f"leaderboard:global:weekly:{d.strftime('%Y-W%W')}"
        elif timeframe == "monthly":
            return f"leaderboard:global:monthly:{d.strftime('%Y-%m')}"
        raise ValueError(f"Invalid timeframe: {timeframe}")

    @staticmethod
    async def get_global_leaderboard(
        db: AsyncSession,
        redis_client: Redis,
        current_user_id: uuid.UUID,
        timeframe: Literal["daily", "weekly", "monthly"],
        target_date: date = None,
        limit: int = 10
    ) -> LeaderboardResponse:
        """
        Fetches the top X globally ranked users for a specific timeframe.
        """
        redis_key = LeaderboardService._build_redis_key(timeframe, target_date)
        
        # 1. Fetch top UUIDs and scores from Redis (O(log(N) + M))
        top_raw_data = await redis_client.zrevrange(redis_key, start=0, end=limit - 1, withscores=True)
        
        ldate_str = target_date.isoformat() if target_date else _get_ist_today().isoformat()
        
        # 2. FALLBACK ARCHITECTURE: If Redis is empty, check PostgreSQL archive (for past dates)
        if not top_raw_data:
            # Query PostgreSQL for the archived version
            archive_result = await db.execute(
                select(HistoricalLeaderboard, User.full_name)
                .join(User, HistoricalLeaderboard.user_id == User.id)
                .where(HistoricalLeaderboard.timeframe == timeframe)
                .where(HistoricalLeaderboard.leaderboard_date == ldate_str)
                .order_by(HistoricalLeaderboard.rank.asc())
                .limit(limit)
            )
            archived_rows = archive_result.all()
            
            if archived_rows:
                top_users = []
                for row, full_name in archived_rows:
                    top_users.append(LeaderboardUser(
                        user_id=row.user_id,
                        full_name=full_name,
                        points=row.points,
                        rank=row.rank
                    ))
                
                # Fetch current user's specific rank from archive
                cu_archive_result = await db.execute(
                    select(HistoricalLeaderboard)
                    .where(HistoricalLeaderboard.user_id == current_user_id)
                    .where(HistoricalLeaderboard.timeframe == timeframe)
                    .where(HistoricalLeaderboard.leaderboard_date == ldate_str)
                )
                cu_archived = cu_archive_result.scalars().first()
                
                cu_rank = cu_archived.rank if cu_archived else 0
                cu_points = cu_archived.points if cu_archived else 0
                
                return LeaderboardResponse(
                    timeframe=timeframe,
                    leaderboard_date=ldate_str,
                    top_users=top_users,
                    current_user_rank=cu_rank,
                    current_user_points=cu_points
                )

        # 3. If data is in Redis, proceed normally...
        user_ids = [uuid.UUID(item[0]) for item in top_raw_data]
        
        # 3. Batch query Postgres for ALL user names at once to prevent N+1 query problem
        users_map = {}
        if user_ids:
            result = await db.execute(select(User.id, User.full_name).where(User.id.in_(user_ids)))
            for row in result.all():
                users_map[row.id] = row.full_name

        # 4. Construct the sorted result list
        top_users = []
        for index, item in enumerate(top_raw_data):
            uid = uuid.UUID(item[0])
            score = int(item[1])
            top_users.append(LeaderboardUser(
                user_id=uid,
                full_name=users_map.get(uid, "Unknown User"), # Fallback if user deleted mid-flight
                points=score,
                rank=index + 1
            ))

        # 5. Get current user's specific global standing
        cu_id_str = str(current_user_id)
        cu_rank_raw = await redis_client.zrevrank(redis_key, cu_id_str)
        cu_points_raw = await redis_client.zscore(redis_key, cu_id_str)
        
        cu_rank = int(cu_rank_raw) + 1 if cu_rank_raw is not None else 0
        cu_points = int(cu_points_raw) if cu_points_raw is not None else 0

        return LeaderboardResponse(
            timeframe=timeframe,
            leaderboard_date=ldate_str,
            top_users=top_users,
            current_user_rank=cu_rank,
            current_user_points=cu_points
        )

    @staticmethod
    async def get_flat_leaderboard(
        db: AsyncSession,
        redis_client: Redis,
        current_user_id: uuid.UUID,
        flat_id: uuid.UUID,
        timeframe: Literal["daily", "weekly", "monthly"],
        target_date: date = None
    ) -> LeaderboardResponse:
        """
        Fetches the leaderboard specifically filtered to members of an active group (Flat).
        """
        # Note: In a massive scale app, you would maintain sub-leaderboards in Redis per flat. 
        # For this hybrid scale, since flats are rarely >100 members, 
        # we fetch all members from DB first, then ask Redis for their specific scores.
        
        # 1. Ensure requesting user is in the flat, and get ALL member IDs 
        result = await db.execute(select(FlatMember.user_id).where(FlatMember.flat_id == flat_id))
        flat_user_ids = [row[0] for row in result.all()]
        
        if current_user_id not in flat_user_ids:
            raise ValueError("You must be a member of this flat to view its leaderboard.")

        # 2. Query Postgres for their names
        users_map = {}
        if flat_user_ids:
            result = await db.execute(select(User.id, User.full_name).where(User.id.in_(flat_user_ids)))
            for row in result.all():
                users_map[row.id] = row.full_name

        redis_key = LeaderboardService._build_redis_key(timeframe, target_date)
        
        # 3. Pull scores for all members using a pipeline 
        flat_scores = []
        async with redis_client.pipeline(transaction=False) as pipe:
            for uid in flat_user_ids:
                pipe.zscore(redis_key, str(uid))
            raw_scores = await pipe.execute()
        
        ldate_str = target_date.isoformat() if target_date else _get_ist_today().isoformat()
        
        # If every single score came back as None, it means the Redis key was likely deleted/archived.
        # So we trigger the fallback to postgres for Flat members.
        all_missing_in_redis = all(score is None for score in raw_scores)
        
        if all_missing_in_redis:
            archive_result = await db.execute(
                select(HistoricalLeaderboard.user_id, HistoricalLeaderboard.points)
                .where(HistoricalLeaderboard.user_id.in_(flat_user_ids))
                .where(HistoricalLeaderboard.timeframe == timeframe)
                .where(HistoricalLeaderboard.leaderboard_date == ldate_str)
            )
            pg_points_map = {row.user_id: row.points for row in archive_result.all()}
            
            for uid in flat_user_ids:
                flat_scores.append({
                    "user_id": uid,
                    "full_name": users_map.get(uid, "Unknown"),
                    "points": pg_points_map.get(uid, 0)
                })
        else:
            # Process Redis data normally
            for uid, raw_score in zip(flat_user_ids, raw_scores):
                points = int(raw_score) if raw_score is not None else 0
                flat_scores.append({
                    "user_id": uid,
                    "full_name": users_map.get(uid, "Unknown"),
                    "points": points
                })
        
        # 4. Sort manually in Python (since we couldn't use zrevrange for a filtered subset)
        # Note: If Flats ever scale past 10,000 users each, this needs shifting purely to ZINTERSTORE.
        flat_scores.sort(key=lambda x: x["points"], reverse=True)
        
        # 5. Reconstruct response payload
        top_users = []
        cu_rank = 0
        cu_points = 0
        
        for index, item in enumerate(flat_scores):
            rank = index + 1
            if item["user_id"] == current_user_id:
                cu_rank = rank
                cu_points = item["points"]
                
            top_users.append(LeaderboardUser(
                user_id=item["user_id"],
                full_name=item["full_name"],
                points=item["points"],
                rank=rank
            ))
            
        return LeaderboardResponse(
            timeframe=timeframe,
            leaderboard_date=ldate_str,
            top_users=top_users,  # Returning all members since it's a private group
            current_user_rank=cu_rank,
            current_user_points=cu_points
        )
