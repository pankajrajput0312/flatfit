import uuid
from pydantic import BaseModel, ConfigDict
from typing import List

class LeaderboardUser(BaseModel):
    """
    Represents a single user's rank on a leaderboard.
    """
    user_id: uuid.UUID
    full_name: str     # Hydrated from PostgreSQL
    points: int        # From Redis ZSET score
    rank: int          # From Redis ZSET rank

    model_config = ConfigDict(from_attributes=True)

class LeaderboardResponse(BaseModel):
    """
    Standard response payload for any leaderboard query.
    """
    timeframe: str     # "daily", "weekly", or "monthly"
    leaderboard_date: str # e.g. "2026-06-03" or "2026-W22"
    top_users: List[LeaderboardUser]
    
    # Optional field showing where the current requesting user stands (if they aren't in top 10)
    current_user_rank: int
    current_user_points: int
