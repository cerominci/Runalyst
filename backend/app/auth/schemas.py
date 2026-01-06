from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from enum import Enum

class SignUpIn(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=72)
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "securepassword123"
            }
        }


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: EmailStr
    is_active: bool
    # FIX: Change type hint from 'str' to 'datetime'
    created_at: datetime 
    
    class Config:
        from_attributes = True

class PasswordResetRequestIn(BaseModel):
    email: EmailStr

class PasswordResetIn(BaseModel):
    token: str
    new_password: str

class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"

class ExperienceLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    ELITE = "elite"

class RunningGoal(str, Enum):
    WEIGHT_LOSS = "weight_loss"
    IMPROVE_FITNESS = "improve_fitness"
    MARATHON_TRAINING = "marathon_training"
    SPEED_IMPROVEMENT = "speed_improvement"
    STRESS_RELIEF = "stress_relief"
    SOCIAL_RUNNING = "social_running"

class ProfileUpdateIn(BaseModel):
    age: Optional[int] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    bio: Optional[str] = None
    gender: Optional[Gender] = None
    experience_level: Optional[ExperienceLevel] = None
    running_goal: Optional[RunningGoal] = None
    has_injuries: Optional[bool] = None


class ProfileOut(ProfileUpdateIn):
    class Config:
        from_attributes = True