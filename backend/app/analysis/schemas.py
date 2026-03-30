from datetime import datetime

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


class AnalysisOut(AnalysisBase):
    id: int
    created_at: datetime