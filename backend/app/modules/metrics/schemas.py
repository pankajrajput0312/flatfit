import uuid
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from datetime import date, datetime
from app.modules.metrics.models import MetricType

# =====================================================================
# REQUEST PAYLOADS (Data flowing INTO the API)
# =====================================================================

class MetricConfigCreate(BaseModel):
    """
    Payload for setting up or updating a user's daily target for a specific metric.
    Example: "I want to drink 3000ml of water per day"
    """
    metric_type: MetricType
    daily_target: float = Field(..., gt=0, description="Target value must be a positive number")
    is_active: bool = True


class MetricLogCreate(BaseModel):
    """
    Payload for logging a metric value.
    Example: "I just drank 500ml of water"
    
    Note: log_date is optional — if not provided the service defaults to today's IST date.
    This allows retroactive logging if a user forgot to log something earlier.
    """
    metric_type: MetricType
    value: float = Field(..., gt=0, description="Value must be greater than zero")
    log_date: Optional[date] = None  # Defaults to today's IST date in the service layer


# =====================================================================
# RESPONSE PAYLOADS (Data flowing OUT OF the API)
# =====================================================================

class MetricConfigResponse(BaseModel):
    """
    Represents a user's active configuration for a single metric type.
    """
    id: uuid.UUID
    metric_type: MetricType
    daily_target: float
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MetricLogResponse(BaseModel):
    """
    Represents a single metric log entry returned after submission.
    Includes goal_met and points_awarded so the frontend can 
    instantly display celebratory UI (e.g., confetti when goal is hit).
    """
    id: uuid.UUID
    metric_type: MetricType
    value: float
    log_date: date
    goal_met: bool
    points_awarded: int
    logged_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DailySummaryResponse(BaseModel):
    """
    Aggregated view of a user's progress for a specific day.
    Returned by the dashboard endpoint to show today's progress rings.
    """
    log_date: date
    metric_type: MetricType
    daily_target: float
    total_logged: float         # Sum of all log entries for this metric on this date
    goal_met: bool
    points_awarded: int         # Total points earned for this metric today
    progress_percent: float     # (total_logged / daily_target) * 100, capped at 100


class StreakResponse(BaseModel):
    """
    Streak data snapshot for a user's profile.
    """
    current_streak: int
    longest_streak: int
    last_active_date: Optional[date] = None
