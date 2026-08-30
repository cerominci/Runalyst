"""
Modal app that runs the Runalyst gait-analysis CV pipeline on a GPU,
on demand. Replaces the old always-on SSH GPU server: this scales to
zero when idle and only bills while a video is actually being processed.

Deploy:   modal deploy modal_worker/app.py
Test one: modal run modal_worker/app.py --video-path "<user_id>/<uuid>.mp4"

The lightweight SQS poller (sqs_poller.py) calls `process_run` remotely
for each queued job; it stays responsible for SQS receive/delete and
posting the result back to the backend, so that side of the contract
documented in CLAUDE.md is unchanged.
"""
import os

import modal

app = modal.App("runalyst-gpu-worker")

# Match the environment the pipeline was actually developed and verified
# against (Colab GPU runtime for the NLF model, and the specific mediapipe
# version noted in gpu_server/algorithms/cliipers_readme.txt).
image = (
    modal.Image.debian_slim(python_version="3.10")
    .apt_install("ffmpeg", "libgl1", "libglib2.0-0", "libsm6", "libxext6", "libxrender1")
    .pip_install(
        "torch",
        "torchvision",
        "opencv-python-headless",
        "mediapipe==0.10.14",
        "numpy<2.0",
        "scipy",
        "matplotlib",
        "Pillow",
        "supabase",
    )
    .add_local_dir(
        os.path.join(os.path.dirname(__file__), "..", "gpu_server", "algorithms"),
        remote_path="/root/algorithms",
    )
    .add_local_dir(
        os.path.join(os.path.dirname(__file__), "..", "gpu_server", "nlf_extractors"),
        remote_path="/root/nlf_extractors",
    )
)

# Caches the (large) NLF checkpoint across cold starts so it isn't
# re-downloaded from GitHub on every invocation.
model_volume = modal.Volume.from_name("nlf-model-cache", create_if_missing=True)
MODEL_CACHE_DIR = "/model_cache"
MODEL_FILENAME = "nlf_l_multi_0.3.2.torchscript"
MODEL_URL = f"https://github.com/isarandi/nlf/releases/download/v0.3.2/{MODEL_FILENAME}"

VIDEO_BUCKET = "user_videos_test"
GPU_TYPE = "T4"  # bump to "A10G" if per-frame latency is too slow


def _ensure_model_downloaded() -> str:
    model_path = os.path.join(MODEL_CACHE_DIR, MODEL_FILENAME)
    if not os.path.exists(model_path):
        import urllib.request

        os.makedirs(MODEL_CACHE_DIR, exist_ok=True)
        print(f"Downloading NLF checkpoint from {MODEL_URL} ...")
        urllib.request.urlretrieve(MODEL_URL, model_path)
        model_volume.commit()
        print("Model cached.")
    return model_path


@app.function(
    image=image,
    gpu=GPU_TYPE,
    volumes={MODEL_CACHE_DIR: model_volume},
    secrets=[modal.Secret.from_name("runalyst-supabase")],
    timeout=600,
    scaledown_window=60,
)
def process_run(run_id: int, video_path: str) -> dict:
    import sys
    import tempfile

    sys.path.insert(0, "/root/algorithms")
    sys.path.insert(0, "/root/nlf_extractors")

    os.environ["NLF_MODEL_PATH"] = _ensure_model_downloaded()

    from supabase import create_client

    from algorithms.pipeline import run_full_pipeline
    from algorithms.video_human_detector import VideoHumanDetector
    from process_video import process_video

    supabase = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])

    with tempfile.TemporaryDirectory() as tmp_dir:
        local_path = os.path.join(tmp_dir, "input.mp4")
        print(f"Downloading {video_path} from Supabase...")
        data = supabase.storage.from_(VIDEO_BUCKET).download(video_path)
        with open(local_path, "wb") as f:
            f.write(data)

        detector = VideoHumanDetector(confidence_threshold=0.5)
        human_indicators, fps, _ = detector.analyze_video(local_path)
        start_frame, end_frame = detector.find_longest_sequence(human_indicators)
        cropped_path = os.path.join(tmp_dir, "cropped.mp4")
        detector.crop_video(local_path, cropped_path, start_frame, end_frame)
        detector.cleanup()

        nlf_output_path, fps_of_video = process_video(cropped_path)
        results = run_full_pipeline(
            path=nlf_output_path,
            label="Runner",
            fps=fps_of_video,
            output_dir=os.path.join(tmp_dir, "pipeline_output"),
            verbose=True,
            save_plots=False,
        )

    return {
        "run_id": run_id,
        "fps": results["metadata"]["fps"],
        "modules": results["modules"],
    }


@app.local_entrypoint()
def main(video_path: str, run_id: int = 0):
    """For manual testing: modal run modal_worker/app.py --video-path "<path>" """
    result = process_run.remote(run_id=run_id, video_path=video_path)
    import json

    print(json.dumps(result, indent=2)[:2000])
