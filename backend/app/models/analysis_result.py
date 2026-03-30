from sqlalchemy import Column, Integer, ForeignKey, DateTime, func, Float
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import relationship

from app.db.base import Base

class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(Integer, ForeignKey('runs.id', ondelete='CASCADE'), unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    avg_stride_length = Column(Float)
    avg_gct = Column(Float)
    avg_speed = Column(Float)
    avg_cadence = Column(Float)

    details = Column(JSON)

    owner = relationship("Run", back_populates="analysis")