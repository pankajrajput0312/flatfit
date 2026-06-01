import uuid
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    """
    Core identity model representing an authenticated user on the platform.
    """
    __tablename__ = "users"

    # We use UUIDv4 for primary keys over auto-incrementing integers to prevent 
    # user enumeration attacks and allow horizontal database sharding in the future.
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # We strictly index email because it is the primary lookup field during login.
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(150), nullable=False)
    
    # Soft deletion/ban flag to prevent destroying relational data (streaks, flats) if a user leaves.
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Security tracking: If a user is compromised, incrementing this invalidated all previous issued JWT refresh tokens.
    token_version = Column(String(36), default=lambda: str(uuid.uuid4()), nullable=False)

    # Auditing constraints: all datetimes MUST enforce timezones at the DB level.
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self):
        return f"<User {self.email}>"
