import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Flat(Base):
    """
    Groups (Flats) allow users to participate in private leaderboards.
    """
    __tablename__ = "flats"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(500), nullable=True)
    
    # We track who created the flat as absolute root owner
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    members = relationship("FlatMember", back_populates="flat", cascade="all, delete-orphan")


class FlatMember(Base):
    """
    Association table modeling the Many-to-Many connection between Users and Flats.
    Includes explicit roles (admin vs member) for scoped permissions.
    """
    __tablename__ = "flat_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    flat_id = Column(UUID(as_uuid=True), ForeignKey("flats.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # "admin" or "member"
    role = Column(String(20), default="member", nullable=False)
    joined_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Prevent a user from joining the same flat twice
    __table_args__ = (
        UniqueConstraint('flat_id', 'user_id', name='uq_flat_user_membership'),
    )

    # Relationships
    flat = relationship("Flat", back_populates="members")
    # In a full ORM loaded state, we could also bind flat_member back to user.
