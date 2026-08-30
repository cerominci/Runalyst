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

sqs = boto3.client("sqs", region_name=AWS_REGION)
process_run = modal.Function.from_name("runalyst-gpu-worker", "process_run")


def main():
    print("SQS poller started (delegating GPU work to Modal). Polling for jobs...")
    while True:
        response = sqs.receive_message(
            QueueUrl=SQS_QUEUE_URL,
            MaxNumberOfMessages=1,
            WaitTimeSeconds=20,
        )
        messages = response.get("Messages", [])
        if not messages:
            continue

        for message in messages:
            receipt_handle = message["ReceiptHandle"]
            try:
                body = json.loads(message["Body"])
                run_id = body.get("run_id")
                video_path = body.get("video_path")
                print(f"Received job: run {run_id}, dispatching to Modal...")

                analysis_results = process_run.remote(run_id=run_id, video_path=video_path)

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

            except Exception as e:
                print(f"Processing error for message: {e}")

        time.sleep(1)


if __name__ == "__main__":
    main()
