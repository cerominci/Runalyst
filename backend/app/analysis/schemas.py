from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel

class AnalysisBase(BaseModel):
    avg_stride_length: float
    avg_gct: float
    avg_speed: float
    avg_cadence: float
    details: dict

    class Config:
        from_attributes = True


class AnalysisCreateIn(AnalysisBase):
    run_id: int

class AnalysisGetIn(BaseModel):
    run_id: int

class AnalysisOut(AnalysisBase):
    id: int
    created_at: datetime


class MetricTrendOut(BaseModel):
    metric_name: str
    values: List[float]
    timestamps: List[datetime]
    percent_change: Optional[float]
    trend_direction: str


class AnalysisHistoryOut(BaseModel):
    analyses: List[AnalysisOut]
    trends: List[MetricTrendOut]