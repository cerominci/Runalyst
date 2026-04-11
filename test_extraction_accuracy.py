"""
Accuracy test for phi3:mini's ability to extract the number of past runs
from natural-language questions, using the same prompt as chat_service.py.
"""

import json
import requests

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
OLLAMA_MODEL = "phi3:mini"

_EXTRACTION_SYSTEM_PROMPT = (
    "You are a data extraction assistant. Given a user's question about their running performance, "
    "extract the number of past runs or sessions they want to analyze. "
    'Return ONLY a valid JSON object with a single key "n" (an integer). '
    "If no specific number is mentioned, default to 5. "
    'Examples: "last 3 runs" -> {"n": 3}, "past 10 sessions" -> {"n": 10}, "recent runs" -> {"n": 5}.'
)

TEST_CASES = [
    ("Can you review my last 3 runs and tell me how my cadence looked?", 3),
    ("I want feedback on my heel strike pattern. Please use my last 6 runs.", 6),
    ("How has my left-right symmetry changed recently?", 5),
    ("Check my last 8 sessions. I want to know whether my foot strike is getting more consistent.", 8),
    ("Review my running form. Focus on cadence and posture.", 5),
    ("Can you look at my previous 4 runs? I'm especially interested in whether my heel strike has improved.", 4),
    ("How has my cadence changed over the last 10 runs? I feel like I've been turning over a bit faster.", 10),
    ("Please analyze my recent runs. Tell me if my symmetry looks better now.", 5),
    ("I want you to review my last 7 feedback reports. Focus on ground contact time.", 7),
    ("Check my foot strike in the past 2 runs.", 2),
    ("Can you review my running metrics? I'm mainly curious about stride length.", 5),
    ("Look at my last 5 sessions and compare my cadence. Has it become more stable?", 5),
    ("Review my most recent runs. I want feedback on heel strike and overstriding.", 5),
    ("Please analyze the last 9 runs. I'm trying to understand whether my left and right sides are moving more symmetrically.", 9),
    ("How is my cadence looking lately? Also tell me if my form is becoming more efficient overall.", 5),
    ("Can you check the previous 12 sessions? Focus on symmetry and foot placement.", 12),
    ("Look at my running form from the last 3 runs. I'm especially interested in knee drive.", 3),
    ("Review my recent feedback. Has my heel strike improved at all?", 5),
    ("I want an analysis of my last 11 runs. Please focus on cadence, symmetry, and foot strike.", 11),
    ("How has my stride length changed in my last 6 sessions? If possible, mention whether it looks more balanced too.", 6),
    ("Can you review my running feedback in general? I'm curious about cadence and ground contact time.", 5),
    ("Use my last 14 runs. I want to know whether my heel strike is still too pronounced.", 14),
    ("Please check my previous 5 workouts. Focus on symmetry between both legs.", 5),
    ("How has my foot strike looked recently? Has it become more midfoot or is it still heel-heavy?", 5),
    ("Analyze my last 13 sessions. I'm most interested in cadence consistency.", 13),
    ("Can you review the past 4 runs? Also tell me whether my posture is holding up better near the end.", 4),
    ("I want feedback on my running mechanics. Focus on heel strike, cadence, and stride length.", 5),
    ("Look at my recent sessions. I'm worried that my left-right symmetry may still be off.", 5),
    ("Please analyze my last 16 runs. I want to know if my cadence and foot strike are improving together.", 16),
    ("Check my last run reports. Focus on ground contact time and balance.", 5),
    ("Can you compare my previous 7 runs? I'm trying to see whether my knee drive has improved.", 7),
    ("Review my running form over the last 15 sessions. Pay special attention to heel strike and overstriding.", 15),
    ("How is my symmetry looking these days? I'm especially curious whether my right side still lands differently.", 5),
    ("Analyze my last 2 runs. I only want feedback on cadence.", 2),
    ("Look at my recent running feedback. Tell me if my foot strike has become more consistent across sessions.", 5),
    ("Please use my last 18 runs. I want an overview of cadence, symmetry, and stride length.", 18),
    ("Can you check whether my heel strike has improved? Review my last 8 sessions for that.", 8),
    ("I want to understand my recent performance better. Focus on posture and cadence.", 5),
    ("Look at the previous 20 runs. Has my ground contact time come down?", 20),
    ("Review my latest sessions. I'm mostly interested in left-right balance and symmetry.", 5),
    ("Please analyze my last 6 runs. Tell me whether my cadence is becoming more even and whether my foot strike looks cleaner.", 6),
    ("How has my heel strike changed over time? Use my recent runs.", 5),
    ("Check my past 9 sessions. I want to know if my stride length is becoming more symmetrical.", 9),
    ("Can you review my running feedback from the last 3 workouts? Focus on cadence and knee drive.", 3),
    ("Look at my running form in general. I care most about foot strike and symmetry.", 5),
    ("Review my previous 10 runs. I'm trying to figure out whether my heel strike is less aggressive now. Also mention cadence if it changed.", 10),
    ("Please check my recent sessions for asymmetry. I feel like one side may still be spending more time on the ground.", 5),
    ("Analyze my last 17 runs. Focus on cadence, foot strike, and ground contact time.", 17),
    ("Can you evaluate my running metrics lately? I'm interested in symmetry and posture, especially when I get tired.", 5),
    ("Use my last 25 sessions. I want a summary of how my cadence, heel strike, and stride balance have evolved.", 25),
]


def extract_n(question: str) -> int:
    full_prompt = f"{_EXTRACTION_SYSTEM_PROMPT}\n\nUser question: {question}"
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
    try:
        parsed = json.loads(raw)
        return max(1, int(parsed.get("n", 5)))
    except (json.JSONDecodeError, ValueError, TypeError):
        return 5


def main():
    correct = 0
    failures = []

    print(f"Running {len(TEST_CASES)} test cases against {OLLAMA_MODEL}...\n")
    print(f"{'#':<4} {'Expected':>8} {'Got':>5}  {'Pass':>5}  Question")
    print("-" * 100)

    for i, (question, expected) in enumerate(TEST_CASES, start=1):
        got = extract_n(question)
        passed = got == expected
        if passed:
            correct += 1
        else:
            failures.append((i, question, expected, got))

        status = "  OK " if passed else " FAIL"
        short_q = question[:70] + "..." if len(question) > 70 else question
        print(f"{i:<4} {expected:>8} {got:>5}  {status}  {short_q}")

    total = len(TEST_CASES)
    accuracy = correct / total * 100
    print("\n" + "=" * 100)
    print(f"Result: {correct}/{total} correct — Accuracy: {accuracy:.1f}%")

    if failures:
        print(f"\nFailed cases ({len(failures)}):")
        for idx, q, exp, got in failures:
            print(f"  [{idx:02d}] expected={exp}, got={got} | {q}")


if __name__ == "__main__":
    main()
