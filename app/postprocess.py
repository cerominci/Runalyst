import json
import statistics
from typing import Any, Dict, List, Optional, Tuple, Union


# ============================================================
# Helpers
# ============================================================

def safe_mean(values: List[float]) -> Optional[float]:
    vals = [float(v) for v in values if v is not None]
    if not vals:
        return None
    return float(sum(vals) / len(vals))


def safe_std(values: List[float]) -> Optional[float]:
    vals = [float(v) for v in values if v is not None]
    if len(vals) < 2:
        return 0.0 if len(vals) == 1 else None
    return float(statistics.pstdev(vals))


def safe_min(values: List[float]) -> Optional[float]:
    vals = [float(v) for v in values if v is not None]
    return float(min(vals)) if vals else None


def safe_max(values: List[float]) -> Optional[float]:
    vals = [float(v) for v in values if v is not None]
    return float(max(vals)) if vals else None


def round_or_none(value: Optional[float], digits: int = 2) -> Optional[float]:
    if value is None:
        return None
    return round(float(value), digits)


def abs_diff_or_none(a: Optional[float], b: Optional[float]) -> Optional[float]:
    if a is None or b is None:
        return None
    return abs(float(a) - float(b))


def signed_diff_or_none(a: Optional[float], b: Optional[float], digits: int = 2) -> Optional[float]:
    if a is None or b is None:
        return None
    return round(float(a) - float(b), digits)


def infer_quality_from_counts(left_count: int, right_count: int) -> str:
    if left_count == 0 and right_count == 0:
        return "low"
    if min(left_count, right_count) == 0:
        return "low"
    if min(left_count, right_count) < 2:
        return "medium"
    if abs(left_count - right_count) >= 2:
        return "medium"
    return "medium-high"


# ============================================================
# Knee flexion
# ============================================================

KNEE_EVENT_KEYS = ["foot_strike", "mid_stance", "toe_off", "mid_swing"]


def _extract_event_angles(events: Dict[str, List[Tuple[int, float]]], event_name: str) -> List[float]:
    raw = events.get(event_name, [])
    return [float(angle) for _, angle in raw]


def _extract_event_times(events, timestamps, offset: int = 1):
    result = {}
    for event_name, pairs in events.items():
        ev_times = []
        for idx, _angle in pairs:
            real_idx = idx + offset
            if 0 <= real_idx < len(timestamps):
                ev_times.append(float(timestamps[real_idx]))
        result[event_name] = ev_times
    return result


def _build_side_event_summary(side_events):
    event_summary = {}
    for event_name in KNEE_EVENT_KEYS:
        angles = _extract_event_angles(side_events, event_name)
        event_summary[event_name] = {
            "angles_deg": [round(a, 2) for a in angles],
            "mean_deg": round_or_none(safe_mean(angles)),
            "std_deg": round_or_none(safe_std(angles)),
            "min_deg": round_or_none(safe_min(angles)),
            "max_deg": round_or_none(safe_max(angles)),
            "count": len(angles),
        }
    return event_summary


def summarize_knee_flexion(knee_result: Dict[str, Any]) -> Dict[str, Any]:
    timestamps = knee_result["timestamps"]
    left_events = knee_result["left_events"]
    right_events = knee_result["right_events"]

    left_summary = _build_side_event_summary(left_events)
    right_summary = _build_side_event_summary(right_events)

    left_times = _extract_event_times(left_events, timestamps, offset=1)
    right_times = _extract_event_times(right_events, timestamps, offset=1)

    left_fs_times = left_times.get("foot_strike", [])
    right_fs_times = right_times.get("foot_strike", [])

    left_cycle_durations = [
        round(left_fs_times[i + 1] - left_fs_times[i], 3)
        for i in range(len(left_fs_times) - 1)
    ]
    right_cycle_durations = [
        round(right_fs_times[i + 1] - right_fs_times[i], 3)
        for i in range(len(right_fs_times) - 1)
    ]

    cycle_count_left = left_summary["foot_strike"]["count"]
    cycle_count_right = right_summary["foot_strike"]["count"]

    return {
        "metric_name": "knee_flexion",
        "left": left_summary,
        "right": right_summary,
        "timing": {
            "left_foot_strike_times_sec": [round(t, 3) for t in left_fs_times],
            "right_foot_strike_times_sec": [round(t, 3) for t in right_fs_times],
            "left_cycle_durations_sec": left_cycle_durations,
            "right_cycle_durations_sec": right_cycle_durations,
            "left_cycle_duration_mean_sec": round_or_none(safe_mean(left_cycle_durations), 3),
            "right_cycle_duration_mean_sec": round_or_none(safe_mean(right_cycle_durations), 3),
        },
        "derived_summary": {
            "cycle_count_left": cycle_count_left,
            "cycle_count_right": cycle_count_right,
            "signal_quality": infer_quality_from_counts(cycle_count_left, cycle_count_right),
            "mid_swing_asymmetry_deg": round_or_none(
                abs_diff_or_none(
                    left_summary["mid_swing"]["mean_deg"],
                    right_summary["mid_swing"]["mean_deg"],
                )
            ),
            "foot_strike_asymmetry_deg": round_or_none(
                abs_diff_or_none(
                    left_summary["foot_strike"]["mean_deg"],
                    right_summary["foot_strike"]["mean_deg"],
                )
            ),
        },
        "measurement_note": (
            "Knee-flexion values are event-based estimates derived from pose data, "
            "smoothing, and heuristic gait-event detection."
        ),
    }


# ============================================================
# Trunk lean
# ============================================================

def summarize_trunk_lean(trunk_result: Dict[str, Any]) -> Dict[str, Any]:
    mean_global = float(trunk_result["mean_global"])
    mean_lower = float(trunk_result["mean_lower"])
    mean_upper = float(trunk_result["mean_upper"])

    if mean_lower > mean_upper + 2:
        source_pattern = "lean driven more from pelvis/lower trunk"
    elif mean_upper > mean_lower + 2:
        source_pattern = "lean driven more from upper trunk/thoracic region"
    else:
        source_pattern = "lean distributed across the trunk"

    if mean_global < 3:
        magnitude_pattern = "very upright trunk posture"
    elif 3 <= mean_global <= 10:
        magnitude_pattern = "global trunk lean in expected range"
    elif mean_global >= 14:
        magnitude_pattern = "marked forward trunk lean"
    else:
        magnitude_pattern = "moderately elevated forward trunk lean"

    return {
        "metric_name": "forward_trunk_lean",
        "global": {
            "mean_deg": round(float(trunk_result["mean_global"]), 2),
            "std_deg": round(float(trunk_result["std_global"]), 2),
            "min_deg": round(float(trunk_result["min_global"]), 2),
            "max_deg": round(float(trunk_result["max_global"]), 2),
        },
        "lower": {
            "mean_deg": round(float(trunk_result["mean_lower"]), 2),
            "std_deg": round(float(trunk_result["std_lower"]), 2),
            "min_deg": round(float(trunk_result["min_lower"]), 2),
            "max_deg": round(float(trunk_result["max_lower"]), 2),
        },
        "upper": {
            "mean_deg": round(float(trunk_result["mean_upper"]), 2),
            "std_deg": round(float(trunk_result["std_upper"]), 2),
            "min_deg": round(float(trunk_result["min_upper"]), 2),
            "max_deg": round(float(trunk_result["max_upper"]), 2),
        },
        "derived_summary": {
            "frame_count_used": len(trunk_result.get("frame_indices", [])),
            "lower_upper_mean_diff_deg": round(abs(mean_lower - mean_upper), 2),
            "source_pattern": source_pattern,
            "magnitude_pattern": magnitude_pattern,
        },
        "measurement_note": "Trunk-lean values are frame-based estimates derived from SMPL pose data.",
    }


# ============================================================
# Pelvis analysis
# ============================================================

def summarize_pelvis_analysis(
    pelvis_result: Union[Tuple, Dict[str, Any], List[Any]]
) -> Dict[str, Any]:
    if isinstance(pelvis_result, (tuple, list)):
        cadence, exc_L, exc_R, hc_L, hc_R, mean_stride_L, mean_stride_R = pelvis_result
    elif isinstance(pelvis_result, dict):
        cadence = pelvis_result.get("cadence")
        exc_L = pelvis_result.get("exc_L")
        exc_R = pelvis_result.get("exc_R")
        hc_L = pelvis_result.get("hc_L")
        hc_R = pelvis_result.get("hc_R")
        mean_stride_L = pelvis_result.get("mean_stride_L")
        mean_stride_R = pelvis_result.get("mean_stride_R")
    else:
        raise TypeError("pelvis_result must be tuple/list/dict")

    return {
        "metric_name": "pelvis_half_cycle_analysis",
        "cadence": {"steps_per_min": round_or_none(cadence, 1)},
        "vertical_excursion": {
            "left_mean": round_or_none(exc_L, 2),
            "right_mean": round_or_none(exc_R, 2),
            "left_right_diff": signed_diff_or_none(exc_L, exc_R, 2),
            "absolute_diff": round_or_none(abs_diff_or_none(exc_L, exc_R), 2),
        },
        "half_cycle_timing": {
            "left_mean_sec": round_or_none(hc_L, 3),
            "right_mean_sec": round_or_none(hc_R, 3),
            "left_right_diff_ms": round_or_none(
                None if hc_L is None or hc_R is None else (hc_L - hc_R) * 1000.0, 1
            ),
            "absolute_diff_ms": round_or_none(
                None if hc_L is None or hc_R is None else abs((hc_L - hc_R) * 1000.0), 1
            ),
        },
        "stride_length": {
            "left_mean": round_or_none(mean_stride_L, 2),
            "right_mean": round_or_none(mean_stride_R, 2),
            "left_right_diff": signed_diff_or_none(mean_stride_L, mean_stride_R, 2),
            "absolute_diff": round_or_none(abs_diff_or_none(mean_stride_L, mean_stride_R), 2),
        },
        "measurement_note": (
            "Pelvis summary values are derived from peak/trough analysis of pelvis vertical motion "
            "and same-foot contact comparisons."
        ),
    }


# ============================================================
# Payload
# ============================================================

def build_llm_payload(
    knee_result: Optional[Dict[str, Any]] = None,
    trunk_result: Optional[Dict[str, Any]] = None,
    pelvis_result: Optional[Union[Tuple, Dict[str, Any], List[Any]]] = None,
    runner_context: Optional[Dict[str, Any]] = None,
    video_metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    payload = {
        "runner_context": runner_context or {},
        "video_metadata": video_metadata or {},
        "metrics": {},
        "limitations": [
            "Assessments are based only on extracted pose-derived features.",
            "Values are approximate and heuristic-derived.",
            "Do not treat the output as medical diagnosis.",
        ],
    }

    if knee_result is not None:
        payload["metrics"]["knee_flexion"] = summarize_knee_flexion(knee_result)

    if trunk_result is not None:
        payload["metrics"]["forward_trunk_lean"] = summarize_trunk_lean(trunk_result)

    if pelvis_result is not None:
        payload["metrics"]["pelvis_half_cycle_analysis"] = summarize_pelvis_analysis(pelvis_result)

    return payload


# ============================================================
# Prompt
# ============================================================

def build_llm_prompt(payload: Dict[str, Any]) -> str:
    instructions = """
You are a cautious running-form analysis assistant.

Your task is to PRIORITIZE suggestions based on:
1. severity of the issue
2. likely impact on running performance

You must analyze only the structured biomechanical measurements below.
Do not assume access to the raw video.
Do not invent measurements.
Do not make medical diagnoses.
Use cautious language.

Return VALID JSON with exactly this schema:

{
  "summary": "short overall summary",
  "issues": [
    {
      "issue": "short issue label",
      "category": "knee_flexion | trunk_lean | pelvis | symmetry | posture | coordination",
      "severity": "low | medium | high",
      "performance_impact": "low | medium | high",
      "priority_score": 0,
      "priority_rank": 1,
      "recommendation": "single practical suggestion",
      "evidence": ["metric_name = value", "metric_name = value"],
      "confidence": "low | medium | high"
    }
  ],
  "limitations": [
    "brief limitations"
  ]
}

Rules:
- priority_score must be an integer from 0 to 100
- priority_rank must rank issues from most important to least important
- sort issues by priority_rank ascending
- if evidence is weak, lower confidence
- prefer at most 5 issues
- if no important issue is found, still return one low-priority issue describing that no strong problem was detected
- priority should reflect BOTH severity and likely effect on performance
""".strip()

    return f"{instructions}\n\nMEASUREMENT_PAYLOAD:\n{json.dumps(payload, indent=2, ensure_ascii=False)}"


def prepare_analysis_for_llm(
    knee_result: Optional[Dict[str, Any]] = None,
    trunk_result: Optional[Dict[str, Any]] = None,
    pelvis_result: Optional[Union[Tuple, Dict[str, Any], List[Any]]] = None,
    runner_context: Optional[Dict[str, Any]] = None,
    video_metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    payload = build_llm_payload(
        knee_result=knee_result,
        trunk_result=trunk_result,
        pelvis_result=pelvis_result,
        runner_context=runner_context,
        video_metadata=video_metadata,
    )
    prompt = build_llm_prompt(payload)
    return {
        "payload": payload,
        "prompt": prompt,
    }