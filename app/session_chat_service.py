import json
import os
import uuid
from typing import Any, Dict

import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-3-flash-preview"

genai.configure(api_key=GEMINI_API_KEY)

_SYSTEM_INSTRUCTION = (
    "You are a professional running coach assistant. "
    "The user has uploaded their running analysis JSON result. "
    "It contains biomechanical data: cadence, strike type, trunk lean, knee flexion angles, "
    "overstride index, and flight time percentages. "
    "Use this data to answer the user's questions with specific, actionable coaching insight. "
    "Refer to concrete numbers from the data when relevant. "
    "If the user asks something unrelated to their running data, politely redirect them."
)

# In-memory session store: session_id -> {"chat": ChatSession, "data_summary": str}
_sessions: Dict[str, Dict[str, Any]] = {}


# ---------------------------------------------------------------------------
# JSON validation & flattening
# ---------------------------------------------------------------------------

_REQUIRED_PATHS = [
    ("modules", "pelvis_analysis", "cadence_steps_per_min"),
    ("modules", "strike_analysis_new", "overall"),
    ("modules", "trunk_lean_analysis", "mean_global"),
    ("modules", "knee_flexion_analysis", "left"),
    ("modules", "alpers_overstride", "mean_overstride_index_deg"),
]


def _validate(data: Dict[str, Any]) -> None:
    for path in _REQUIRED_PATHS:
        node = data
        for key in path:
            if not isinstance(node, dict) or key not in node:
                raise ValueError(
                    f"Missing expected field in JSON: {' > '.join(path)}"
                )
            node = node[key]


def _flatten_to_text(data: Dict[str, Any]) -> str:
    """Extract the meaningful metrics from a pipeline result JSON into plain text."""
    m = data["modules"]
    pelvis    = m["pelvis_analysis"]
    trunk     = m["trunk_lean_analysis"]
    knee      = m["knee_flexion_analysis"]
    overstride = m["alpers_overstride"]
    strike    = m["strike_analysis_new"]
    flight    = m.get("swing_stance_analysis", {}) \
                 .get("flight_metrics", {}) \
                 .get("overall_averages", {})

    label = data.get("metadata", {}).get("label", "Runner")

    lines = [
        f"Runner label: {label}",
        f"Strike type: {strike['overall']} (confidence: {strike.get('confidence', 'n/a')})",
        f"Cadence: {pelvis['cadence_steps_per_min']:.1f} steps/min",
        f"Mean stride L: {pelvis.get('mean_stride_L', 'n/a')} px  |  R: {pelvis.get('mean_stride_R', 'n/a')} px",
        "",
        "Trunk lean (global):",
        f"  mean={trunk['mean_global']:.2f}°  std={trunk['std_global']:.2f}°"
        f"  min={trunk['min_global']:.2f}°  max={trunk['max_global']:.2f}°",
        "",
        "Knee flexion — LEFT:",
        f"  foot_strike mean={knee['left']['foot_strike']['mean_deg']:.1f}°  std={knee['left']['foot_strike']['std_deg']:.1f}°",
        f"  mid_stance  mean={knee['left']['mid_stance']['mean_deg']:.1f}°",
        f"  toe_off     mean={knee['left']['toe_off']['mean_deg']:.1f}°",
        f"  mid_swing   mean={knee['left']['mid_swing']['mean_deg']:.1f}°  std={knee['left']['mid_swing']['std_deg']:.1f}°",
        "Knee flexion — RIGHT:",
        f"  foot_strike mean={knee['right']['foot_strike']['mean_deg']:.1f}°  std={knee['right']['foot_strike']['std_deg']:.1f}°",
        f"  mid_stance  mean={knee['right']['mid_stance']['mean_deg']:.1f}°",
        f"  toe_off     mean={knee['right']['toe_off']['mean_deg']:.1f}°",
        f"  mid_swing   mean={knee['right']['mid_swing']['mean_deg']:.1f}°  std={knee['right']['mid_swing']['std_deg']:.1f}°",
        "",
        "Overstride (Alper's method):",
        f"  mean_alpha={overstride['mean_alpha_deg']:.2f}°"
        f"  mean_lean_forward={overstride['mean_lean_forward_deg']:.2f}°"
        f"  overstride_index={overstride['mean_overstride_index_deg']:.2f}°",
        f"  comment: {overstride.get('comment', '')}",
    ]

    if flight:
        lines += [
            "",
            "Flight time %:",
            f"  avg_left={flight.get('avg_left_flight', 'n/a'):.1f}%"
            f"  avg_right={flight.get('avg_right_flight', 'n/a'):.1f}%"
            f"  avg_double={flight.get('avg_double_flight', 'n/a'):.1f}%",
        ]

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def create_session(raw_json: Dict[str, Any]) -> str:
    """Validate the uploaded JSON, create a Gemini chat session, return session_id."""
    _validate(raw_json)
    data_text = _flatten_to_text(raw_json)

    model = genai.GenerativeModel(
        model_name=GEMINI_MODEL,
        system_instruction=_SYSTEM_INSTRUCTION,
    )

    # Seed the conversation with the run data as the first user turn so Gemini
    # has it in context for all subsequent messages.
    seed_message = (
        "Here is the running analysis data for this session:\n\n"
        f"{data_text}\n\n"
        "Please confirm you have received it and are ready to answer questions."
    )

    chat = model.start_chat(history=[])
    print("\n[GEMINI SEED MESSAGE] >>>")
    print(seed_message)
    print("<<<\n")
    chat.send_message(seed_message)

    session_id = str(uuid.uuid4())
    _sessions[session_id] = {"chat": chat, "data_summary": data_text}
    return session_id


def ask(session_id: str, question: str) -> str:
    """Send a follow-up question to an existing session."""
    if session_id not in _sessions:
        raise KeyError(f"Session '{session_id}' not found. Start a new session first.")
    print(f"\n[GEMINI MESSAGE] session={session_id} >>>")
    print(question)
    print("<<<\n")
    response = _sessions[session_id]["chat"].send_message(question)
    return response.text


def delete_session(session_id: str) -> None:
    """Remove a session from memory."""
    _sessions.pop(session_id, None)
