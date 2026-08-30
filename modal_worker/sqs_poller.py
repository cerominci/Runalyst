"""
Lightweight, CPU-only replacement for the old gpu_server/api_endpoint/server.py.

Runs continuously on a cheap always-on host (e.g. a Render Background
Worker) and does exactly what the old worker did for queue handling:
poll SQS, and on success POST results to the backend and delete the
message. The difference is it no longer runs the CV pipeline itself -
it calls out to the `process_run` function deployed on Modal
(modal_worker/app.py), which does the actual GPU work and downloads
the video from Supabase directly.

Env vars required: SQS_QUEUE_URL, AWS_REGION, GPU_API_KEY, BACKEND_SAVE_URL.
Modal auth comes from the machine's `modal` token (set via `modal token set`
or MODAL_TOKEN_ID / MODAL_TOKEN_SECRET env vars).
"""
import json
import os
import time

import boto3
import modal
import requests
from dotenv import load_dotenv

load_dotenv()

SQS_QUEUE_URL = os.environ["SQS_QUEUE_URL"]
AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")
GPU_API_KEY = os.environ["GPU_API_KEY"]
BACKEND_SAVE_URL = os.environ["BACKEND_SAVE_URL"]
# e.g. https://your-backend.onrender.com/runs/update-status
BACKEND_UPDATE_STATUS_URL = os.environ.get(
    "BACKEND_UPDATE_STATUS_URL", BACKEND_SAVE_URL.replace("/analysis/save-result", "/runs/update-status")
)

# process_run can legitimately take minutes (see modal_worker/app.py's own
# timeout=600). SQS's default visibility timeout is only ~30s, so without
# this a message reappears on the queue - and could get picked up by a
# second poller instance, or this one after a redeploy overlap - while the
# first attempt is still running, causing duplicate GPU runs and duplicate
# backend POSTs. Fix: claim the message for INITIAL_VISIBILITY_TIMEOUT up
# front, then heartbeat-extend it every HEARTBEAT_INTERVAL while we wait,
# instead of guessing one big static timeout.
INITIAL_VISIBILITY_TIMEOUT = 120  # seconds
HEARTBEAT_INTERVAL = 45  # seconds
VISIBILITY_EXTENSION = 120  # seconds, applied on each heartbeat
MAX_WAIT_SECONDS = 900  # give up (mark failed) if Modal never returns by then

sqs = boto3.client("sqs", region_name=AWS_REGION)
process_run = modal.Function.from_name("runalyst-gpu-worker", "process_run")


def _wait_with_heartbeat(call: modal.FunctionCall, receipt_handle: str):
    """Poll a spawned Modal call, extending the SQS message's visibility
    timeout each time we're still waiting, so it doesn't reappear on the
    queue while processing is still genuinely in progress."""
    waited = 0
    while waited < MAX_WAIT_SECONDS:
        try:
            return call.get(timeout=HEARTBEAT_INTERVAL)
        except TimeoutError:
            # Modal's FunctionCall.get() raises Python's *builtin*
            # TimeoutError (not modal.exception.TimeoutError) to mean "no
            # result yet, keep waiting" - confirmed against modal's source
            # (modal/_functions.py's poll_function). A real remote failure,
            # e.g. modal.exception.FunctionTimeoutError when the function
            # itself exceeds its own configured timeout, is a distinct,
            # unrelated exception type and is intentionally NOT caught here
            # - it should propagate immediately as a genuine failure rather
            # than being treated as "still running".
            waited += HEARTBEAT_INTERVAL
            sqs.change_message_visibility(
                QueueUrl=SQS_QUEUE_URL,
                ReceiptHandle=receipt_handle,
                VisibilityTimeout=VISIBILITY_EXTENSION,
            )
    raise TimeoutError(f"process_run did not finish within {MAX_WAIT_SECONDS}s")


def _mark_failed(run_id) -> None:
    if run_id is None:
        return
    try:
        requests.patch(
            BACKEND_UPDATE_STATUS_URL,
            params={"run_id": run_id, "new_status": "failed"},
            headers={"X-GPU-API-Key": GPU_API_KEY},
            timeout=10,
        )
    except Exception as e:
        print(f"Failed to mark run {run_id} as failed: {e}")


def main():
    print("SQS poller started (delegating GPU work to Modal). Polling for jobs...")
    while True:
        response = sqs.receive_message(
            QueueUrl=SQS_QUEUE_URL,
            MaxNumberOfMessages=1,
            WaitTimeSeconds=20,
            VisibilityTimeout=INITIAL_VISIBILITY_TIMEOUT,
        )
        messages = response.get("Messages", [])
        if not messages:
            continue

        for message in messages:
            receipt_handle = message["ReceiptHandle"]
            run_id = None
            try:
                body = json.loads(message["Body"])
                run_id = body.get("run_id")
                video_path = body.get("video_path")
                print(f"Received job: run {run_id}, dispatching to Modal...")

                call = process_run.spawn(run_id=run_id, video_path=video_path)
                analysis_results = _wait_with_heartbeat(call, receipt_handle)

                print(f"Modal finished run {run_id}, sending results to backend...")
                resp = requests.post(
                    BACKEND_SAVE_URL,
                    json=analysis_results,
                    headers={"X-GPU-API-Key": GPU_API_KEY},
                    timeout=30,
                )

                if resp.status_code in (200, 201):
                    print("Success! Deleting message from SQS.")
                    sqs.delete_message(QueueUrl=SQS_QUEUE_URL, ReceiptHandle=receipt_handle)
                else:
                    print(f"Backend error {resp.status_code}: {resp.text}")
                    _mark_failed(run_id)

            except Exception as e:
                print(f"Processing error for message (run {run_id}): {e}")
                _mark_failed(run_id)

        time.sleep(1)


if __name__ == "__main__":
    main()
