import uuid
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

# =====================================================================
# REQUEST PAYLOADS (Data flowing INTO the API)
# =====================================================================

class FlatCreate(BaseModel):
    """
    Blueprint when a User clicks "Create Flat".
    """
    name: str = Field(..., min_length=3, max_length=100, description="The display name of the fitness group")
    description: Optional[str] = Field(None, max_length=500, description="Optional motto or description")

class FlatJoin(BaseModel):
    """
    Blueprint when a User enters an Invite Code to join.
    """
    invite_code: str = Field(..., min_length=6, max_length=10, description="The dynamic Redis code")

# =====================================================================
# RESPONSE PAYLOADS (Data flowing OUT OF the API)
# =====================================================================

class FlatMemberResponse(BaseModel):
    """
    Shows a user inside a flat.
    """
    user_id: uuid.UUID
    role: str
    joined_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class FlatResponse(BaseModel):
    """
    Public representation of the Group.
    """
    id: uuid.UUID
    name: str
    description: Optional[str]
    created_by_id: uuid.UUID
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class FlatInviteResponse(BaseModel):
    """
    Response returned when an Admin generates a shareable invite link.
    """
    invite_code: str
    expires_in_seconds: int
    flat_id: uuid.UUID
