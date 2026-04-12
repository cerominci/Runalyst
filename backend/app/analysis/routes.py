from typing import List
import logging

from fastapi import Depends, status, APIRouter, HTTPException
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.analysis.schemas import AnalysisCreateIn, AnalysisOut, AnalysisHistoryOut, MetricTrendOut, AnalysisGetIn
from app.deps.auth import get_current_user
from app.deps.db import get_db
from app.models.analysis_result import AnalysisResult
from app.models.run import Run
from app.models.user import User

router = APIRouter(prefix="/analysis", tags=["analyses"])

logger = logging.getLogger(__name__)

@router.post("/save",status_code=status.HTTP_201_CREATED)

def save_analysis_results(
        payload: AnalysisCreateIn,
        db: Session = Depends(get_db)
):
    existing_analysis = db.query(AnalysisResult).filter(
        AnalysisResult.run_id == payload.run_id
    ).first()

    if existing_analysis:
        logger.info(f"Overwriting existing analysis for run_id: {payload.run_id}")

        existing_analysis.avg_stride_length = payload.avg_stride_length
        existing_analysis.avg_gct = payload.avg_gct
        existing_analysis.avg_speed = payload.avg_speed
        existing_analysis.avg_cadence = payload.avg_cadence
        existing_analysis.details = payload.details
    else:
        new_result = AnalysisResult(
            run_id=payload.run_id,
            avg_stride_length=payload.avg_stride_length,
            avg_gct=payload.avg_gct,
            avg_speed=payload.avg_speed,
            avg_cadence=payload.avg_cadence,
            details=payload.details
        )
        db.add(new_result)

    run = db.query(Run).filter(Run.id == payload.run_id).first()
    if run:
        run.status = "completed"

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to save analysis for run {payload.run_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Database commit failed")

    return {"message": "Analysis saved successfully"}

@router.post("/get", response_model=AnalysisOut, status_code=status.HTTP_200_OK)
def get_analysis(
        payload: AnalysisGetIn,
        db: Session = Depends(get_db),
        user: User = Depends(get_current_user)
):
    analysis = db.query(AnalysisResult).filter(AnalysisResult.run_id == payload.run_id).first()

    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    run = db.query(Run).filter(Run.id == payload.run_id, Run.user_id == user.id).first()
    if not run:
        raise HTTPException(status_code=403, detail="Access denied")

    return analysis


@router.get("/all", response_model=List[AnalysisOut])
def get_all_user_analyses(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    results = (
        db.query(AnalysisResult)
        .join(Run, AnalysisResult.run_id == Run.id)
        .filter(Run.user_id == current_user.id)
        .order_by(desc(AnalysisResult.created_at))
        .all()
    )

    if not results:
        return []

    return results


def _linear_regression_slope(values: list) -> float:
    n = len(values)
    if n < 2:
        return 0.0
    x_mean = (n - 1) / 2.0
    y_mean = sum(values) / n
    numerator = sum((i - x_mean) * (values[i] - y_mean) for i in range(n))
    denominator = sum((i - x_mean) ** 2 for i in range(n))
    if denominator == 0.0:
        return 0.0
    return numerator / denominator


def _compute_trends(analyses: list) -> list:
    TRACKED_METRICS = {
        "avg_stride_length": "avg_stride_length",
        "avg_gct": "avg_gct",
        "avg_speed": "avg_speed",
        "avg_cadence": "avg_cadence",
    }

    trends = []
    for metric_name, attr in TRACKED_METRICS.items():
        data_points = [
            (a.created_at, float(getattr(a, attr)))
            for a in analyses
            if getattr(a, attr) is not None
        ]

        values = [dp[1] for dp in data_points]
        timestamps = [dp[0] for dp in data_points]

        if len(data_points) < 2:
            trends.append(MetricTrendOut(
                metric_name=metric_name,
                values=values,
                timestamps=timestamps,
                percent_change=None,
                trend_direction="insufficient_data"
            ))
            continue

        first_val, last_val = values[0], values[-1]
        percent_change = round(((last_val - first_val) / abs(first_val)) * 100.0, 2) if first_val != 0.0 else None

        slope = _linear_regression_slope(values)
        if abs(slope) < 0.01:
            direction = "stable"
        else:
            direction = "improving" if slope > 0 else "declining"

        trends.append(MetricTrendOut(
            metric_name=metric_name,
            values=values,
            timestamps=timestamps,
            percent_change=percent_change,
            trend_direction=direction
        ))

    return trends


@router.get("/history", response_model=AnalysisHistoryOut)
def get_analysis_history(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    analyses = (
        db.query(AnalysisResult)
        .join(Run, AnalysisResult.run_id == Run.id)
        .filter(Run.user_id == current_user.id)
        .order_by(AnalysisResult.created_at.asc())
        .all()
    )

    trends = _compute_trends(analyses)
    return AnalysisHistoryOut(analyses=analyses, trends=trends)
