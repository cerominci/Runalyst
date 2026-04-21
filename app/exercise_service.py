import json
import os
from typing import Any, Dict, List, Optional

import google.generativeai as genai
from dotenv import load_dotenv

from app.postprocess import build_llm_payload

load_dotenv()

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-3-flash-preview"

genai.configure(api_key=GEMINI_API_KEY)


# ─────────────────────────────────────────────────────────────────────────────
# Exercise knowledge base
# ─────────────────────────────────────────────────────────────────────────────

EXERCISE_LIBRARY: Dict[str, Dict[str, Any]] = {
    "low_cadence": {
        "issue_label": "Low cadence",
        "category": "cadence",
        "exercises": [
            {
                "name": "Metronome cadence runs",
                "type": "drill",
                "description": "Run to a metronome set 5–10% above current cadence for 30-second intervals.",
                "volume": "6 × 30 sec at target cadence, 30 sec rest",
                "focus": "Increase step rate without increasing speed",
            },
            {
                "name": "A-skips",
                "type": "drill",
                "description": "Exaggerated marching skip with high knee drive and quick ground contact.",
                "volume": "3 × 20 m",
                "focus": "Neuromuscular cadence patterning",
            },
            {
                "name": "Quick feet ladder drill",
                "type": "drill",
                "description": "Rapid alternating steps through an agility ladder.",
                "volume": "4 passes",
                "focus": "Ground contact time reduction",
            },
        ],
    },
    "heel_strike": {
        "issue_label": "Heel strike pattern",
        "category": "foot_strike",
        "exercises": [
            {
                "name": "Barefoot / minimal shoe strides",
                "type": "technique_modification",
                "description": "Short strides (60–80 m) on grass barefoot to encourage natural forefoot loading.",
                "volume": "6 × 60 m strides",
                "focus": "Shift contact point from heel to midfoot",
            },
            {
                "name": "Eccentric calf raises",
                "type": "strength",
                "description": "Single-leg eccentric lowering on a step — slow 3-sec descent.",
                "volume": "3 × 15 reps each leg",
                "focus": "Prepare Achilles and calf for midfoot loading",
            },
            {
                "name": "High-knee marching",
                "type": "drill",
                "description": "Slow exaggerated high-knee march, landing softly on the ball of the foot.",
                "volume": "3 × 20 m",
                "focus": "Foot landing position awareness",
            },
        ],
    },
    "excessive_trunk_lean": {
        "issue_label": "Excessive forward trunk lean (>10°)",
        "category": "trunk_lean",
        "exercises": [
            {
                "name": "Dead bug",
                "type": "strength",
                "description": "Supine anti-extension core stabiliser — opposite arm/leg lower and return.",
                "volume": "3 × 10 reps each side",
                "focus": "Deep core stability to resist trunk collapse",
            },
            {
                "name": "Plank with shoulder tap",
                "type": "strength",
                "description": "Forearm plank; alternate shoulder taps without rotating hips.",
                "volume": "3 × 30 sec",
                "focus": "Anti-rotation core stiffness",
            },
            {
                "name": "Posture wall drill",
                "type": "technique_modification",
                "description": "Stand 30 cm from a wall, fall forward into single-leg balance — lean from ankles, not waist.",
                "volume": "3 × 5 reps each side",
                "focus": "Internalise ankle-driven lean",
            },
        ],
    },
    "upright_posture": {
        "issue_label": "Overly upright trunk posture (<3°)",
        "category": "trunk_lean",
        "exercises": [
            {
                "name": "Kneeling hip flexor stretch",
                "type": "mobility",
                "description": "Deep kneeling lunge with slight forward lean from the hip.",
                "volume": "3 × 45 sec each side",
                "focus": "Release hip flexor restriction that inhibits forward lean",
            },
            {
                "name": "Wall fall drill",
                "type": "technique_modification",
                "description": "Lean into a wall with arms extended; push away and take one stride, maintaining full-body forward lean.",
                "volume": "3 × 8 reps",
                "focus": "Produce lean from ankles, not waist",
            },
        ],
    },
    "stiff_knee_landing": {
        "issue_label": "Stiff knee at foot strike (near full extension)",
        "category": "knee_flexion",
        "exercises": [
            {
                "name": "Box step-downs",
                "type": "strength",
                "description": "Step off a low box (15–20 cm), land softly with ~20–30° knee bend.",
                "volume": "3 × 12 reps each leg",
                "focus": "Teach elastic, flexed-knee landing mechanics",
            },
            {
                "name": "Single-leg squat",
                "type": "strength",
                "description": "Slow-tempo single-leg squat or Bulgarian split squat.",
                "volume": "3 × 10 reps each leg",
                "focus": "Quad and glute strength for shock absorption",
            },
            {
                "name": "Pogo hops",
                "type": "drill",
                "description": "Begin with stiff-ankle bounces, progressively absorb more with knee bend.",
                "volume": "3 × 20 reps",
                "focus": "Transition from stiff to compliant landing",
            },
        ],
    },
    "poor_knee_drive": {
        "issue_label": "Reduced knee drive at mid-swing",
        "category": "knee_flexion",
        "exercises": [
            {
                "name": "Resisted high knees",
                "type": "drill",
                "description": "High-knee drill with a resistance band around waist.",
                "volume": "3 × 20 m",
                "focus": "Hip flexor and iliopsoas activation",
            },
            {
                "name": "Straight-leg bounding",
                "type": "drill",
                "description": "Exaggerated bounding pulling knee up actively before each ground contact.",
                "volume": "4 × 20 m",
                "focus": "Hip flexion strength and timing",
            },
            {
                "name": "Seated knee raises",
                "type": "strength",
                "description": "Seated at edge of a box, alternating knee raises against resistance band.",
                "volume": "3 × 15 reps each side",
                "focus": "Isolated hip flexor strengthening",
            },
        ],
    },
    "overstride": {
        "issue_label": "Overstriding",
        "category": "overstride",
        "exercises": [
            {
                "name": "Cadence +5% run",
                "type": "technique_modification",
                "description": "Run at same pace while deliberately increasing cadence by 5% — naturally shortens stride.",
                "volume": "3 × 3 min at elevated cadence",
                "focus": "Reduce anterior foot placement",
            },
            {
                "name": "A-skips",
                "type": "drill",
                "description": "Focus on landing directly under hip, not in front of the body.",
                "volume": "3 × 20 m",
                "focus": "Foot-strike position under centre of mass",
            },
            {
                "name": "Downhill acceleration strides",
                "type": "drill",
                "description": "Short controlled accelerations on a gentle slope — allows natural stride shortening.",
                "volume": "4 × 40 m",
                "focus": "Feel of efficient stride length",
            },
        ],
    },
    "knee_asymmetry": {
        "issue_label": "Left-right knee flexion asymmetry",
        "category": "symmetry",
        "exercises": [
            {
                "name": "Single-leg balance on foam pad",
                "type": "stability",
                "description": "30-second single-leg stance on unstable surface, eyes closed.",
                "volume": "3 × 30 sec each side",
                "focus": "Proprioceptive correction of weaker side",
            },
            {
                "name": "Step-up with knee drive",
                "type": "strength",
                "description": "Step onto a box, drive opposite knee up, pause at top.",
                "volume": "3 × 12 reps each leg",
                "focus": "Bilateral strength balance",
            },
        ],
    },
    "upper_trunk_lean": {
        "issue_label": "Lean driven from upper trunk / thoracic region",
        "category": "trunk_lean",
        "exercises": [
            {
                "name": "Thoracic rotation stretch",
                "type": "mobility",
                "description": "Seated or kneeling thoracic rotation with hands behind head.",
                "volume": "3 × 10 reps each side",
                "focus": "Thoracic mobility and extension",
            },
            {
                "name": "Band pull-apart",
                "type": "strength",
                "description": "Resistance band held at shoulder height, pull apart to activate mid-traps.",
                "volume": "3 × 15 reps",
                "focus": "Posterior shoulder girdle stability",
            },
        ],
    },
    "lower_trunk_lean": {
        "issue_label": "Lean driven from pelvis / lower trunk (anterior pelvic tilt)",
        "category": "posture",
        "exercises": [
            {
                "name": "Couch stretch (hip flexor)",
                "type": "mobility",
                "description": "Kneeling hip flexor stretch with back foot elevated on a bench.",
                "volume": "3 × 60 sec each side",
                "focus": "Reduce anterior pelvic tilt contribution to lean",
            },
            {
                "name": "Glute bridge",
                "type": "strength",
                "description": "Double and single-leg glute bridges with posterior pelvic tilt at the top.",
                "volume": "3 × 15 reps",
                "focus": "Posterior chain activation for pelvic control",
            },
        ],
    },
    "stride_asymmetry": {
        "issue_label": "Stride length asymmetry between sides",
        "category": "symmetry",
        "exercises": [
            {
                "name": "Lateral bounding",
                "type": "drill",
                "description": "Single-leg lateral hops focusing on equal push-off force each side.",
                "volume": "3 × 10 reps each side",
                "focus": "Symmetrical propulsion",
            },
            {
                "name": "Single-leg Romanian deadlift",
                "type": "strength",
                "description": "Hinge on one leg with dumbbell/kettlebell, keep hips square.",
                "volume": "3 × 10 reps each side",
                "focus": "Posterior chain and balance symmetry",
            },
        ],
    },
}

SEVERITY_RANK = {"high": 3, "medium": 2, "low": 1}


# ─────────────────────────────────────────────────────────────────────────────
# Rule-based issue detector
# ─────────────────────────────────────────────────────────────────────────────

def identify_form_issues(payload: Dict[str, Any]) -> List[Dict[str, Any]]:
    metrics = payload.get("metrics", {})
    runner_ctx = payload.get("runner_context", {})
    issues: Dict[str, Dict[str, Any]] = {}

    def _add(key: str, severity: str, evidence: str) -> None:
        if key not in issues or SEVERITY_RANK[severity] > SEVERITY_RANK[issues[key]["severity"]]:
            issues[key] = {"key": key, "severity": severity, "evidence": evidence}

    # ── Pelvis / cadence ──────────────────────────────────────────────────────
    pelvis = metrics.get("pelvis_half_cycle_analysis")
    if pelvis:
        cadence = (pelvis.get("cadence") or {}).get("steps_per_min")
        if cadence is not None:
            if cadence < 150:
                _add("low_cadence", "high", f"cadence = {cadence} spm (target ≥ 160)")
            elif cadence < 160:
                _add("low_cadence", "medium", f"cadence = {cadence} spm (target ≥ 160)")

        stride_diff = (pelvis.get("stride_length") or {}).get("absolute_diff")
        if stride_diff is not None and stride_diff > 150:
            sev = "high" if stride_diff > 300 else "medium"
            _add("stride_asymmetry", sev, f"stride_length_abs_diff = {stride_diff} px")

    # ── Trunk lean ────────────────────────────────────────────────────────────
    trunk = metrics.get("forward_trunk_lean")
    if trunk:
        global_mean = (trunk.get("global") or {}).get("mean_deg")
        if global_mean is not None:
            if global_mean > 14:
                _add("excessive_trunk_lean", "high", f"trunk_lean_global_mean = {global_mean}°")
            elif global_mean > 10:
                _add("excessive_trunk_lean", "medium", f"trunk_lean_global_mean = {global_mean}°")
            elif global_mean < 3:
                _add("upright_posture", "medium", f"trunk_lean_global_mean = {global_mean}° (very upright)")

        source = (trunk.get("derived_summary") or {}).get("source_pattern", "")
        if "upper trunk" in source:
            _add("upper_trunk_lean", "low", source)
        elif "pelvis/lower" in source:
            _add("lower_trunk_lean", "medium", source)

    # ── Knee flexion ──────────────────────────────────────────────────────────
    knee = metrics.get("knee_flexion")
    if knee:
        for side in ("left", "right"):
            side_data = knee.get(side) or {}

            fs_mean = (side_data.get("foot_strike") or {}).get("mean_deg")
            if fs_mean is not None and fs_mean > 165:
                sev = "high" if fs_mean > 170 else "medium"
                _add("stiff_knee_landing", sev,
                     f"knee_{side}_foot_strike_mean = {fs_mean}° (near full extension)")

            ms_mean = (side_data.get("mid_swing") or {}).get("mean_deg")
            if ms_mean is not None and ms_mean > 100:
                _add("poor_knee_drive", "medium",
                     f"knee_{side}_mid_swing_mean = {ms_mean}° (low flexion at mid-swing)")

        ds = knee.get("derived_summary") or {}
        ms_asym = ds.get("mid_swing_asymmetry_deg")
        if ms_asym is not None and ms_asym > 5:
            sev = "high" if ms_asym > 10 else "medium"
            _add("knee_asymmetry", sev, f"mid_swing_asymmetry = {ms_asym}°")

    # ── Runner context (strike type, overstride) ──────────────────────────────
    strike = runner_ctx.get("strike_type")
    if strike and str(strike).upper() == "HEEL":
        _add("heel_strike", "medium", "strike_type = HEEL")

    overstride_index = runner_ctx.get("overstride_index")
    if overstride_index is not None:
        sev = "high" if float(overstride_index) > 20 else "medium"
        _add("overstride", sev, f"overstride_index = {overstride_index}°")

    # Sort: high → medium → low
    return sorted(
        issues.values(),
        key=lambda x: SEVERITY_RANK[x["severity"]],
        reverse=True,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Prompt builder
# ─────────────────────────────────────────────────────────────────────────────

def _build_exercise_prompt(
    flagged_issues: List[Dict[str, Any]],
    exercises_by_issue: List[Dict[str, Any]],
    runner_context: Dict[str, Any],
) -> str:
    issues_text = json.dumps(flagged_issues, indent=2, ensure_ascii=False)
    exercises_text = json.dumps(exercises_by_issue, indent=2, ensure_ascii=False)
    ctx_text = json.dumps(runner_context, indent=2, ensure_ascii=False) if runner_context else "{}"

    instructions = """
You are an expert running coach. You have been given:
1. A list of biomechanical form issues identified from video analysis, ordered by severity.
2. A candidate set of exercises and drills for each issue.
3. Runner context (experience level, goals, etc.) if available.

Your task: produce a personalised, prioritised exercise plan.

Return VALID JSON with exactly this schema:

{
  "summary": "2–3 sentence coaching summary of the main form problems and overall prescription focus",
  "plan": [
    {
      "priority": 1,
      "issue": "issue label",
      "severity": "high | medium | low",
      "exercises": [
        {
          "name": "exercise name",
          "type": "strength | drill | technique_modification | mobility | stability",
          "description": "clear how-to instruction",
          "volume": "sets × reps or duration",
          "focus": "what this exercise corrects",
          "coaching_cue": "one key cue the runner should feel or think during this exercise"
        }
      ],
      "technique_note": "one sentence on how to consciously apply the fix during the next run"
    }
  ],
  "weekly_integration": "short paragraph on how to fit these drills into a weekly training schedule",
  "caution": "any relevant safety or progression note"
}

Rules:
- Keep priority ranking consistent with issue severity (high severity = lower priority number).
- Select the 2–3 most relevant exercises per issue — do not include all candidates if they overlap.
- Tailor coaching_cue to the specific metric evidence provided.
- weekly_integration should be practical (e.g. before easy runs, twice per week).
- Use cautious language; do not make medical claims.
""".strip()

    return (
        f"{instructions}\n\n"
        f"RUNNER CONTEXT:\n{ctx_text}\n\n"
        f"FLAGGED ISSUES:\n{issues_text}\n\n"
        f"CANDIDATE EXERCISES:\n{exercises_text}"
    )


# ─────────────────────────────────────────────────────────────────────────────
# Main entry point
# ─────────────────────────────────────────────────────────────────────────────

def generate_exercise_recommendations(data) -> Dict[str, Any]:
    payload = build_llm_payload(
        knee_result=data.knee_result,
        trunk_result=data.trunk_result,
        pelvis_result=data.pelvis_result,
        runner_context=data.runner_context,
        video_metadata=data.video_metadata,
    )

    flagged_issues = identify_form_issues(payload)

    # Attach candidate exercises from the knowledge base to each flagged issue
    exercises_by_issue = []
    for issue in flagged_issues:
        lib_entry = EXERCISE_LIBRARY.get(issue["key"])
        if lib_entry:
            exercises_by_issue.append({
                "issue_key": issue["key"],
                "issue_label": lib_entry["issue_label"],
                "severity": issue["severity"],
                "evidence": issue["evidence"],
                "candidate_exercises": lib_entry["exercises"],
            })

    runner_context = data.runner_context or {}

    prompt = _build_exercise_prompt(flagged_issues, exercises_by_issue, runner_context)

    model = genai.GenerativeModel(GEMINI_MODEL)
    raw_response = model.generate_content(prompt).text

    # Strip markdown code fences if Gemini wraps the JSON
    cleaned = raw_response.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("```", 2)[1]
        if cleaned.startswith("json"):
            cleaned = cleaned[4:]
        cleaned = cleaned.rsplit("```", 1)[0].strip()

    try:
        exercise_plan = json.loads(cleaned)
    except json.JSONDecodeError:
        exercise_plan = {
            "summary": "Model returned non-JSON output.",
            "plan": [],
            "weekly_integration": "",
            "caution": "JSON parsing failed.",
            "raw_output": raw_response,
        }

    return {
        "flagged_issues": flagged_issues,
        "exercise_plan": exercise_plan,
    }
