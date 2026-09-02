import os
import cv2
import json
import torch
import torchvision
import numpy as np
from PIL import Image

MODEL_PATH = os.environ.get("NLF_MODEL_PATH", "/home/runalyst/nlf/models/nlf_l_multi_0.3.2.torchscript")

_model = None
_device = None


def _get_model():
    global _model, _device
    if _model is None:
        _device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        _model = torch.jit.load(MODEL_PATH).to(_device).eval()
    return _model, _device


def _to_jsonable(x):
    if isinstance(x, torch.Tensor):
        return x.detach().cpu().tolist()
    if isinstance(x, np.ndarray):
        return x.tolist()
    if isinstance(x, dict):
        return {k: _to_jsonable(v) for k, v in x.items()}
    if isinstance(x, (list, tuple)):
        return [_to_jsonable(v) for v in x]
    return x


def _run_nlf_on_frame(model, device, frame_bgr):
    frame_rgb = frame_bgr[:, :, ::-1]
    img = Image.fromarray(frame_rgb).convert("RGB")
    img_t = torchvision.transforms.functional.to_tensor(img).to(device)
    frame_batch = img_t.unsqueeze(0)

    pred = model.detect_smpl_batched(frame_batch, model_name="smpl")
    pred = _to_jsonable(pred)

    joints_3d = pred.get("joints3d", None)
    return joints_3d


def process_video(video_path):
    if not os.path.isfile(video_path):
        raise FileNotFoundError(f"Video not found: {video_path}")

    model, device = _get_model()

    output_dir = os.path.join(os.path.dirname(video_path), "nlf_outputs")
    os.makedirs(output_dir, exist_ok=True)

    base_name = os.path.splitext(os.path.basename(video_path))[0]
    output_path = os.path.join(output_dir, f"output_{base_name}.jsonl")

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise RuntimeError(f"Could not open video: {video_path}")

    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    with open(output_path, "w", encoding="utf-8") as f:
        frame_index = 0
        with torch.inference_mode():
            for _ in range(total_frames):
                ok, frame = cap.read()
                if not ok:
                    break

                timestamp_sec = frame_index / fps if fps > 0 else None

                try:
                    joints_3d = _run_nlf_on_frame(model, device, frame)
                    record = {
                        "frame_index": frame_index,
                        "timestamp_sec": timestamp_sec,
                        "joints_3d": joints_3d,
                    }
                except Exception as e:
                    print(f"  FRAME {frame_index} ERROR: {e}")
                    record = {
                        "frame_index": frame_index,
                        "timestamp_sec": timestamp_sec,
                        "error": str(e),
                    }

                f.write(json.dumps(record) + "\n")
                frame_index += 1

    cap.release()
    return output_path, fps


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python process_video.py <video_path>")
        sys.exit(1)

    path, video_fps = process_video(sys.argv[1])
    print(f"Output: {path}")
    print(f"FPS: {video_fps}")