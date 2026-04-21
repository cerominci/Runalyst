import json
import requests
from app.postprocess import prepare_analysis_for_llm

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
OLLAMA_MODEL = "phi3:mini"


def generate_analysis_feedback(data):
    llm_ready = prepare_analysis_for_llm(
        knee_result=data.knee_result,
        trunk_result=data.trunk_result,
        pelvis_result=data.pelvis_result,
        runner_context=data.runner_context,
        video_metadata=data.video_metadata,
    )

    payload = llm_ready["payload"]
    prompt = llm_ready["prompt"]

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
            "format": "json"
        },
        timeout=180,
    )
    response.raise_for_status()

    raw_text = response.json()["response"]

    try:
        llm_feedback = json.loads(raw_text)
    except json.JSONDecodeError:
        llm_feedback = {
            "summary": "Model returned non-JSON output.",
            "issues": [],
            "limitations": ["JSON parsing failed."],
            "raw_output": raw_text,
        }

    return {
        "payload": payload,
        "prompt": prompt,
        "llm_feedback": llm_feedback,
    }