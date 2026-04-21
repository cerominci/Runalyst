import os
import json
import time
import uuid
import boto3
import requests
from supabase import create_client
from gpu_server.algorithms.pipeline import run_full_pipeline

SQS_QUEUE_URL = os.environ.get("SQS_QUEUE_URL")
AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
bucket_name = "user_videos_test"

BACKEND_SAVE_URL = "https://your-api-domain.com/analysis/save-result"

sqs = boto3.client("sqs", region_name=AWS_REGION)
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def placeholder_video_to_nlf(video_path: str):
    mock_nlf_path = "mock_path.jsonl"
    return mock_nlf_path


def run_analyze_pipeline(nlf_output_path: str):
    print(f" AI: Analyzing nlf at {nlf_output_path}...")
    results = run_full_pipeline(path=nlf_output_path, label="Runner", fps=60, output_dir="pipeline_output", verbose=True)

    # Must match AnalysisCreateIn schema from backend
    return results


def main():
    print("GPU Worker started. Polling SQS for jobs...")

    while True:
        response = sqs.receive_message(
            QueueUrl=SQS_QUEUE_URL,
            MaxNumberOfMessages=1,
            WaitTimeSeconds=20
        )

        messages = response.get("Messages", [])
        if not messages:
            continue

        for message in messages:
            receipt_handle = message['ReceiptHandle']
            try:
                body = json.loads(message['Body'])
                run_id = body.get("run_id")
                video_path = body.get("video_path")

                print(f" Received Job: Run ID {run_id}")

                local_filename = f"job_{run_id}_{uuid.uuid4().hex[:8]}.mp4"
                print(f"Downloading {video_path}...")

                with open(local_filename, "wb") as f:
                    data = supabase.storage.from_(bucket_name).download(video_path)
                    f.write(data)

                nlf_output_path = placeholder_video_to_nlf(video_path)
                analysis_results = run_analyze_pipeline(nlf_output_path)

                analysis_results["run_id"] = run_id

                print(f" Sending results to backend for Run {run_id}...")
                resp = requests.post(BACKEND_SAVE_URL, json=analysis_results)

                if resp.status_code in [200, 201]:
                    print("Success! Deleting message from SQS.")
                    sqs.delete_message(QueueUrl=SQS_QUEUE_URL, ReceiptHandle=receipt_handle)
                else:
                    print(f"Backend error {resp.status_code}: {resp.text}")

                if os.path.exists(local_filename):
                    os.remove(local_filename)

            except Exception as e:
                print(f"  Processing error: {str(e)}")

        time.sleep(1)


if __name__ == "__main__":
    main()