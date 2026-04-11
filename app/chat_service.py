import json
import os
from datetime import datetime, timedelta
from typing import Any, Dict, List

import requests
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

from app.schemas import ChatRequest, ChatResponse

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
OLLAMA_MODEL = "phi3:mini"

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-3-flash-preview"

genai.configure(api_key=GEMINI_API_KEY)

_EXTRACTION_SYSTEM_PROMPT = (
    "You are a data extraction assistant. Given a user's question about their running performance, "
    "extract the number of past runs or sessions they want to analyze. "
    'Return ONLY a valid JSON object with a single key "n" (an integer). '
    "If no specific number is mentioned, default to 5. "
    'Examples: "last 3 runs" -> {"n": 3}, "past 10 sessions" -> {"n": 10}, "recent runs" -> {"n": 5}.'
)


def extract_n_from_question(question: str) -> int:
    """Send the user's question to the local Ollama instance to extract n."""
    full_prompt = f"{_EXTRACTION_SYSTEM_PROMPT}\n\nUser question: {question}"
    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": OLLAMA_MODEL,
                "prompt": full_prompt,
                "stream": False,
                "format": "json",
            },
            timeout=60,
        )
        response.raise_for_status()
        raw = response.json().get("response", "{}")
        parsed = json.loads(raw)
        return max(1, int(parsed.get("n", 5)))
    except requests.exceptions.ConnectionError:
        raise RuntimeError(
            f"Cannot reach Ollama at {OLLAMA_URL}. Is 'ollama serve' running?"
        )
    except (json.JSONDecodeError, ValueError, TypeError):
        return 5


# ---------------------------------------------------------------------------
# Mock database layer — replace with real DB queries when ready
# ---------------------------------------------------------------------------
#TODO: ceren backende bağla
def get_last_n_feedbacks(user_id: str, n: int) -> List[Dict[str, Any]]:
    """
    MOCK — returns n pipeline-result records for user_id, ordered oldest → newest.
    Each record mirrors the structure stored in the database (Runner_results.json schema).
    Replace the body of this function with an actual DB query.
    """
    base_date = datetime(2026, 4, 11)
    runs = []
    for i in range(n):
        run_date = base_date - timedelta(days=(n - i - 1) * 3)

        # Simulate gradual improvement over sessions (i=0 is oldest, i=n-1 is newest)
        cadence = round(154.0 + i * 0.6, 2)
        trunk_mean = round(5.8 - i * 0.08, 3)
        overstride_index = round(15.8 - i * 0.12, 3)
        left_fs_mean = round(155.2 - i * 0.15, 3)   # knee more flexed at foot-strike → improvement
        right_fs_mean = round(151.8 - i * 0.18, 3)
        left_swing_mean = round(85.5 + i * 0.3, 3)
        right_swing_mean = round(87.1 + i * 0.25, 3)
        avg_left_flight = round(70.0 + i * 0.2, 2)
        avg_right_flight = round(66.5 + i * 0.15, 2)
        strike_type = "HEEL" if i < n // 2 else "MIDFOOT"

        runs.append({
            "run_id": f"{user_id}_run_{i + 1:03d}",
            "date": run_date.strftime("%Y-%m-%d"),
            "metadata": {
                "label": user_id,
                "fps": 60.0,
            },
            "modules": {
                "contact_and_overstride": {
                    "status": "success",
                    "strike_type": strike_type,
                    "confidence": "high",
                    "overstride": [
                        round(328.0 - i * 1.5, 1),
                        "yes" if overstride_index > 14.0 else "no",
                        7,
                        7,
                    ],
                },
                "strike_analysis_new": {
                    "overall": strike_type,
                    "confidence": "high",
                    "metrics_agree": True,
                    "primary": strike_type,
                    "validation": strike_type,
                },
                "pelvis_analysis": {
                    "cadence_steps_per_min": cadence,
                    "summary": {
                        "avg_excursion_L": round(81.1 + i * 0.3, 3),
                        "avg_excursion_R": round(82.2 - i * 0.1, 3),
                        "avg_half_cycle_L_s": round(0.378 - i * 0.001, 4),
                        "avg_half_cycle_R_s": round(0.389 - i * 0.001, 4),
                        "avg_excursion_all": round(81.7 + i * 0.1, 3),
                    },
                    "mean_stride_L": round(2647.0 + i * 5.0, 3),
                    "mean_stride_R": round(2629.0 + i * 4.5, 3),
                },
                "swing_stance_analysis": {
                    "flight_metrics": {
                        "overall_averages": {
                            "avg_left_flight": avg_left_flight,
                            "avg_right_flight": avg_right_flight,
                            "avg_double_flight": round(38.0 - i * 0.1, 2),
                        }
                    }
                },
                "trunk_lean_analysis": {
                    "mean_global": trunk_mean,
                    "std_global": round(1.57 - i * 0.01, 3),
                    "min_global": round(2.24 - i * 0.02, 3),
                    "max_global": round(9.37 - i * 0.05, 3),
                },
                "knee_flexion_analysis": {
                    "left": {
                        "foot_strike": {"mean_deg": left_fs_mean, "std_deg": round(2.16 - i * 0.02, 3)},
                        "mid_stance":  {"mean_deg": round(133.1 + i * 0.05, 3), "std_deg": 0.688},
                        "toe_off":     {"mean_deg": round(148.3 - i * 0.1, 3),  "std_deg": round(8.21 - i * 0.05, 3)},
                        "mid_swing":   {"mean_deg": left_swing_mean, "std_deg": round(4.57 - i * 0.03, 3)},
                    },
                    "right": {
                        "foot_strike": {"mean_deg": right_fs_mean, "std_deg": round(7.77 - i * 0.05, 3)},
                        "mid_stance":  {"mean_deg": round(132.6 + i * 0.04, 3), "std_deg": round(3.74 - i * 0.03, 3)},
                        "toe_off":     {"mean_deg": round(146.0 - i * 0.08, 3), "std_deg": round(3.92 - i * 0.02, 3)},
                        "mid_swing":   {"mean_deg": right_swing_mean, "std_deg": round(5.57 - i * 0.04, 3)},
                    },
                },
                "alpers_overstride": {
                    "mean_alpha_deg": round(22.06 - i * 0.1, 3),
                    "mean_lean_forward_deg": round(9.55 + i * 0.05, 3),
                    "mean_overstride_index_deg": overstride_index,
                    "comment": (
                        "Belirgin overstride eğilimi." if overstride_index > 14.5
                        else "Overstride index improving."
                    ),
                },
            },
        })
    return runs  # oldest first → newest last


# ---------------------------------------------------------------------------
# Prompt building + Gemini call
# ---------------------------------------------------------------------------

def _build_context_prompt(question: str, feedbacks: List[Dict[str, Any]]) -> str:
    run_blocks = []
    for idx, fb in enumerate(feedbacks):
        m = fb["modules"]
        pelvis   = m["pelvis_analysis"]
        trunk    = m["trunk_lean_analysis"]
        knee     = m["knee_flexion_analysis"]
        overstride = m["alpers_overstride"]
        flight   = m["swing_stance_analysis"]["flight_metrics"]["overall_averages"]
        strike   = m["strike_analysis_new"]["overall"]

        block = (
            f"--- Run {idx + 1} ({fb['date']}) ---\n"
            f"  strike_type: {strike}\n"
            f"  cadence_spm: {pelvis['cadence_steps_per_min']}\n"
            f"  mean_stride_L_px: {pelvis['mean_stride_L']}\n"
            f"  mean_stride_R_px: {pelvis['mean_stride_R']}\n"
            f"  trunk_lean_mean_deg: {trunk['mean_global']}\n"
            f"  trunk_lean_std_deg: {trunk['std_global']}\n"
            f"  knee_L_foot_strike_mean_deg: {knee['left']['foot_strike']['mean_deg']}\n"
            f"  knee_R_foot_strike_mean_deg: {knee['right']['foot_strike']['mean_deg']}\n"
            f"  knee_L_mid_swing_mean_deg: {knee['left']['mid_swing']['mean_deg']}\n"
            f"  knee_R_mid_swing_mean_deg: {knee['right']['mid_swing']['mean_deg']}\n"
            f"  avg_left_flight_pct: {flight['avg_left_flight']}\n"
            f"  avg_right_flight_pct: {flight['avg_right_flight']}\n"
            f"  mean_overstride_index_deg: {overstride['mean_overstride_index_deg']}\n"
            f"  overstride_comment: {overstride['comment']}"
        )
        run_blocks.append(block)

    runs_text = "\n\n".join(run_blocks)
    return (
        "You are a professional running coach assistant. "
        "Below are the chronological running session analysis results for a user, from oldest to most recent. "
        "Analyse any trends and use this data to answer the user's question with specific, actionable insight.\n\n"
        f"=== Running Session History ({len(feedbacks)} runs) ===\n{runs_text}\n\n"
        f"=== User Question ===\n{question}"
    )


def _ask_gemini(prompt: str) -> str:
    
    model = genai.GenerativeModel(GEMINI_MODEL)
    response = model.generate_content(prompt)
    return response.text


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------

def chat(request: ChatRequest) -> ChatResponse:
    # 1. Use Ollama to extract how many past runs the user cares about
    n = extract_n_from_question(request.question)

    # 2. Fetch the last n feedbacks (mock)
    feedbacks = get_last_n_feedbacks(request.user_id, n)

    # 3. Inject feedbacks chronologically into a structured prompt
    prompt = _build_context_prompt(request.question, feedbacks)

    # 4. Send enriched prompt to Gemini and return the answer
    answer = _ask_gemini(prompt)

    return ChatResponse(
        question=request.question,
        n_runs_considered=n,
        answer=answer,
    )
