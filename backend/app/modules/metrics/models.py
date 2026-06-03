import uuid
import enum
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Date, ForeignKey, UniqueConstraint, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base


class MetricType(str, enum.Enum):
    """
    Enumeration of all supported metric types.
    Extending this enum in the future adds a new trackable metric system-wide.
    """
    WORKOUT = "workout"       # Mandatory - points generating
    PROTEIN = "protein"       # Mandatory - points generating (grams)
    WATER = "water"           # Mandatory - points generating (ml)
    WEIGHT = "weight"         # Optional - informational (kg)
    SLEEP = "sleep"           # Optional - informational (hours)
    STEPS = "steps"           # Optional - informational (count)
    CALORIES = "calories"     # Optional - informational (kcal)


# Metrics that generate leaderboard points when daily target is met
MANDATORY_METRICS = {MetricType.WORKOUT, MetricType.PROTEIN, MetricType.WATER}

# Points awarded per mandatory metric completion
METRIC_POINTS = {
    MetricType.WORKOUT: 50,
    MetricType.PROTEIN: 30,
    MetricType.WATER: 20,
}


class UserMetricConfig(Base):
    """
    Stores each user's personal daily targets per metric.
    Controls which metrics are active for a given user.
    One row per user per metric type.
    """
    __tablename__ = "user_metric_configs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # The type of metric being configured
    metric_type = Column(SAEnum(MetricType), nullable=False)
    
    # The daily target value (e.g. 3000 for 3L water, 150 for 150g protein, 1 for workout done)
    daily_target = Column(Float, nullable=False, default=1.0)
    
    # If false, this metric is hidden from the user's dashboard
    is_active = Column(Boolean, default=True, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # A user can only have ONE config per metric type
    __table_args__ = (
        UniqueConstraint("user_id", "metric_type", name="uq_user_metric_config"),
    )

    def __repr__(self):
        return f"<UserMetricConfig user={self.user_id} metric={self.metric_type} target={self.daily_target}>"


class MetricLog(Base):
    """
    Immutable daily tracking ledger.
    Each row represents a single metric entry for a user on a given date.
    This table is APPEND-ONLY — rows are never updated after insertion.
    It serves as the single source of truth for streak calculation and point auditing.
    """
    __tablename__ = "metric_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # The metric being logged
    metric_type = Column(SAEnum(MetricType), nullable=False, index=True)

    # The actual value logged (e.g. 2500 for 2.5L water)
    value = Column(Float, nullable=False)

    # The IST calendar date this log belongs to (critical for streak calculation)
    log_date = Column(Date, nullable=False, index=True)

    # Whether this individual log entry caused the daily target to be reached
    # Set to True by the service layer when cumulative daily value >= daily_target
    goal_met = Column(Boolean, default=False, nullable=False)

    # Points awarded for this entry (only non-zero when mandatory metric goal is first met for the day)
    points_awarded = Column(Integer, default=0, nullable=False)

    # Immutable audit timestamp
    logged_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    def __repr__(self):
        return f"<MetricLog user={self.user_id} type={self.metric_type} value={self.value} date={self.log_date}>"
