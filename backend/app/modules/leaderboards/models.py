import uuid
from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class HistoricalLeaderboard(Base):
    """
    Permanent archive for past leaderboards.
    Celery writes to this table automatically at midnight, then clears Redis.
    """
    __tablename__ = "historical_leaderboards"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # "daily", "weekly", or "monthly"
    timeframe = Column(String(20), nullable=False)
    
    # Store as string so it directly matches our Redis keys (e.g. "2026-06-03" or "2026-W22")
    leaderboard_date = Column(String(20), nullable=False, index=True)
    
    points = Column(Integer, nullable=False)
    rank = Column(Integer, nullable=False)

    archived_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # A user can only have one rank per specific timeframe + date
    __table_args__ = (
        UniqueConstraint("user_id", "timeframe", "leaderboard_date", name="uq_historical_leaderboard_entry"),
    )
