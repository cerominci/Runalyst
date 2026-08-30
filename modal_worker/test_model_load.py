"""One-off, fully self-contained script to verify the NLF checkpoint loads
and runs a forward pass on Modal's GPU, before trusting the full pipeline
to it. Not part of the deployed app - delete after verifying.

Run: modal run modal_worker/test_model_load.py
"""
import modal

app = modal.App("runalyst-nlf-model-test")

image = modal.Image.debian_slim(python_version="3.10").pip_install(
    "torch", "torchvision", "numpy<2.0", "Pillow"
)

model_volume = modal.Volume.from_name("nlf-model-cache", create_if_missing=True)
MODEL_CACHE_DIR = "/model_cache"
MODEL_FILENAME = "nlf_l_multi_0.3.2.torchscript"
MODEL_URL = f"https://github.com/isarandi/nlf/releases/download/v0.3.2/{MODEL_FILENAME}"


@app.function(image=image, gpu="T4", volumes={MODEL_CACHE_DIR: model_volume}, timeout=300)
def test_load():
    import os
    import urllib.request

    import torch
    import torchvision
    import numpy as np
    from PIL import Image

    print("torch:", torch.__version__)
    print("torchvision:", torchvision.__version__)
    print("cuda available:", torch.cuda.is_available())

    model_path = os.path.join(MODEL_CACHE_DIR, MODEL_FILENAME)
    if not os.path.exists(model_path):
        os.makedirs(MODEL_CACHE_DIR, exist_ok=True)
        print(f"Downloading NLF checkpoint from {MODEL_URL} ...")
        urllib.request.urlretrieve(MODEL_URL, model_path)
        model_volume.commit()
        print("Model cached. Size (MB):", os.path.getsize(model_path) / 1e6)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = torch.jit.load(model_path).to(device).eval()
    print("Model loaded OK.")

    dummy = Image.fromarray((np.random.rand(480, 640, 3) * 255).astype("uint8"))
    img_t = torchvision.transforms.functional.to_tensor(dummy).to(device)
    batch = img_t.unsqueeze(0)
    with torch.inference_mode():
        pred = model.detect_smpl_batched(batch, model_name="smpl")
    joints = pred.get("joints3d")
    shape = list(joints.shape) if hasattr(joints, "shape") else joints
    print("Forward pass OK. joints3d shape:", shape)
    return "OK"


@app.local_entrypoint()
def run_test():
    print(test_load.remote())
