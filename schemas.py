from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=2, max_length=120)

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    model_config = ConfigDict(from_attributes=True)

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class EventIn(BaseModel):
    source: str = Field(min_length=1, max_length=80)
    event_type: str = Field(min_length=1, max_length=80)
    value: float = Field(default=1, ge=-1_000_000, le=1_000_000)
    metadata: dict = Field(default_factory=dict)

class EventOut(BaseModel):
    id: int
    source: str
    event_type: str
    value: float
    metadata: dict
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class DashboardSummary(BaseModel):
    total_events: int
    active_sources: int
    total_value: float
    anomaly_count: int
    events_delta: float
