# Modal GPU worker

Replaces the old always-on SSH GPU server. The CV pipeline (`gpu_server/algorithms`,
`gpu_server/nlf_extractors`) now runs on-demand on [Modal](https://modal.com),
which scales to zero when idle. A small always-on poller still watches SQS and
handles the backend contract, exactly like the old worker did.

## Pieces

- **`app.py`** — the Modal app. `process_run(run_id, video_path)` downloads the
  video from Supabase, runs human detection + NLF pose extraction + the gait
  analysis pipeline, and returns the results dict. Deployed once; scales
  automatically per invocation.
- **`sqs_poller.py`** — lightweight, CPU-only, always-on. Polls SQS like the
  old worker did, calls `process_run` on Modal for the GPU work, POSTs the
  result to `BACKEND_SAVE_URL`, and deletes the SQS message on success.
  Meant to run somewhere cheap and always-on (e.g. a Render Background Worker).

## One-time setup

```bash
pip install modal
modal token new                    # authenticate this machine
modal secret create runalyst-supabase SUPABASE_URL=... SUPABASE_SERVICE_KEY=...
modal deploy modal_worker/app.py   # builds the image, registers process_run
```

The NLF checkpoint (`nlf_l_multi_0.3.2.torchscript`, public release from
https://github.com/isarandi/nlf) is downloaded once into a Modal Volume on
first cold start and reused afterward - no need to bundle or host it yourself.

## Running the poller

```bash
pip install -r modal_worker/requirements.txt
export SQS_QUEUE_URL=... AWS_REGION=... GPU_API_KEY=... BACKEND_SAVE_URL=...
export MODAL_TOKEN_ID=... MODAL_TOKEN_SECRET=...   # or `modal token set` once on the host
python modal_worker/sqs_poller.py
```

## Redeploying after changing the pipeline code

`app.py` mounts `../gpu_server/algorithms` and `../gpu_server/nlf_extractors`
directly, so editing those files and running `modal deploy modal_worker/app.py`
again picks up the changes - no need to duplicate code into this folder.

## Cost notes

- GPU type defaults to T4 (`GPU_TYPE` in `app.py`) - bump to `A10G` in the
  `@app.function(...)` decorator if per-video latency is too slow.
- You only pay while `process_run` is actually executing; the poller itself
  is CPU-only and cheap to leave running continuously.
