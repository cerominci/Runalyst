import os
import json
import time
import uuid
import boto3
import requests
from supabase import create_client
from gpu_server.algorithms.pipeline import run_full_pipeline
from gpu_server.nlf_extractors.process_video import process_video
from dotenv import load_dotenv
from gpu_server.algorithms.video_human_detector import VideoHumanDetector
load_dotenv()

SQS_QUEUE_URL = os.environ.get("SQS_QUEUE_URL")
AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")
bucket_name = "user_videos_test"
GPU_API_KEY = os.environ.get("GPU_API_KEY")
BACKEND_SAVE_URL = os.environ.get("BACKEND_SAVE_URL")
#BACKEND_SAVE_URL = "https://runalyst-backend-2xbs.onrender.com/analysis/save-result"

sqs = boto3.client("sqs", region_name=AWS_REGION)
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def placeholder_video_to_nlf(video_path: str):
    mock_nlf_path = "mock_path.jsonl"
    return mock_nlf_path


def analyze_and_crop_to_human_segment(detector: VideoHumanDetector, video_path: str) -> str:
    """
    Analyze video for human presence and crop to longest human sequence.
    
    Args:
        detector: VideoHumanDetector instance
        video_path: Path to the video file
        
    Returns:
        Path to the cropped video file
    """
    print(f"Analyzing video for human detection...")
    human_indicators, fps, _ = detector.analyze_video(video_path)
    
    # Find longest continuous sequence of human presence
    start_frame, end_frame = detector.find_longest_sequence(human_indicators)
    
    # Generate cropped video path with "_cropped" suffix
    cropped_path = video_path.replace(".mp4", "_cropped.mp4")
    
    # Crop video to longest human sequence
    print(f"Cropping video to longest human sequence...")
    detector.crop_video(video_path, cropped_path, start_frame, end_frame)
    
    return cropped_path

# def run_analyze_pipeline(nlf_output_path: str):
#     print(f" AI: Analyzing nlf at {nlf_output_path}...")
#     results = run_full_pipeline(path=nlf_output_path, label="Runner", fps=, output_dir="pipeline_output", verbose=True)

#     # Must match AnalysisCreateIn schema from backend
#     return results


def main():
    print("GPU Worker started. Polling SQS for jobs...")
    detector = VideoHumanDetector(confidence_threshold=0.5)
    while True:
        response = sqs.receive_message(
            QueueUrl=SQS_QUEUE_URL,
            MaxNumberOfMessages=1,
            WaitTimeSeconds=20
        )

        messages = response.get("Messages", [])

        if not messages:
            print("No messages yet")
            continue

        for message in messages:
            receipt_handle = message['ReceiptHandle']
            try:
                body = json.loads(message['Body'])
                run_id = body.get("run_id")
                video_path = body.get("video_path")

                print(f" Received Job: Run ID {run_id}")

                local_filename = os.path.join(os.getcwd(), f"job_{run_id}_{uuid.uuid4().hex[:8]}.mp4")
                print(f"Downloading {video_path}...")

                with open(local_filename, "wb") as f:
                    data = supabase.storage.from_(bucket_name).download(video_path)
                    f.write(data)

                if not os.path.exists(local_filename):
                    raise FileNotFoundError(f"Failed to download video to {local_filename}")

                print(f"Download done, processing {video_path}...")

                # Analyze and crop video to longest human sequence
                cropped_filename = analyze_and_crop_to_human_segment(detector, local_filename)

                nlf_output_path,fps_of_video = process_video(cropped_filename)
                analysis_results_with_metadata = run_full_pipeline(path=nlf_output_path, label="Runner", fps=fps_of_video, output_dir="pipeline_output", verbose=True, save_plots=False)

                analysis_results = {
                    "run_id": run_id,
                    "fps": analysis_results_with_metadata["metadata"]["fps"],
                    "modules": analysis_results_with_metadata["modules"]
                }

                print(f" Sending results to backend for Run {run_id}...")
                resp = requests.post(BACKEND_SAVE_URL, json=analysis_results, headers={"X-GPU-API-Key": GPU_API_KEY})

                if resp.status_code in [200, 201]:
                    print("Success! Deleting message from SQS.")
                    sqs.delete_message(QueueUrl=SQS_QUEUE_URL, ReceiptHandle=receipt_handle)
                else:
                    print(f"Backend error {resp.status_code}: {resp.text}")

                if os.path.exists(local_filename):
                    os.remove(local_filename)
                if os.path.exists(cropped_filename):
                    os.remove(cropped_filename)

            except Exception as e:
                print(f"  Processing error: {str(e)}")

        time.sleep(1)


if __name__ == "__main__":
    main()