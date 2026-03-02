import json
import numpy as np
import matplotlib.pyplot as plt
from scipy.signal import savgol_filter

JSONL_PATH = "/Users/edd/Documents/nlf_algo/output_yerden_kamera_alper2.jsonl"

with open("joint_indices.json", "r") as f:
    joint_index = json.load(f)

LEFT_ANKLE_INDEX = joint_index["left_ankle"]
RIGHT_ANKLE_INDEX = joint_index["right_ankle"]

timestamps = []
left_ankle_y = []
right_ankle_y = []

with open(JSONL_PATH, "r", encoding="utf-8") as f:
    for line in f:
        data = json.loads(line)

        if "joints_3d" not in data or data["joints_3d"] is None:
            continue

        joints = data["joints_3d"]

        # Flatten [1,1,55,3] → [55,3]
        try:
            joints = joints[0][0]
        except:
            continue

        if len(joints) <= RIGHT_ANKLE_INDEX:
            continue

        ts = data.get("timestamp_sec")
        if ts is None:
            continue

        left_y = -1 * joints[LEFT_ANKLE_INDEX][1]
        right_y = -1 * joints[RIGHT_ANKLE_INDEX][1]

        timestamps.append(ts)
        left_ankle_y.append(left_y)
        right_ankle_y.append(right_y)

timestamps = np.array(timestamps)
left_ankle_y = np.array(left_ankle_y)
right_ankle_y = np.array(right_ankle_y)

# smoothing graph with Savitzky-Golay filter
# Estimate FPS from timestamps
if len(timestamps) > 1:
    dt = np.mean(np.diff(timestamps))
    fps_est = 1.0 / dt
else:
    fps_est = 30  # fallback

# Window ≈ 0.25 seconds of data
window_length = int(0.25 * fps_est)

# Must be odd and >= poly_order+2
if window_length % 2 == 0:
    window_length += 1

window_length = max(window_length, 5)

# Ensure window not larger than signal
if window_length >= len(left_ankle_y):
    window_length = len(left_ankle_y) - 1
    if window_length % 2 == 0:
        window_length -= 1

poly_order = 3

left_smooth = savgol_filter(left_ankle_y, window_length, poly_order)
right_smooth = savgol_filter(right_ankle_y, window_length, poly_order)

# Plot
plt.figure(figsize=(12,6))

#non-smoothed with low alpha for context, can comment out in prod
plt.plot(timestamps, left_ankle_y, color="blue", alpha=0.25)
plt.plot(timestamps, right_ankle_y, color="red", alpha=0.25)

plt.plot(timestamps, left_smooth, color="blue", label="Left Ankle (smoothed)")
plt.plot(timestamps, right_smooth, color="red", label="Right Ankle (smoothed)")

plt.xlabel("Time (seconds)")
plt.ylabel("Flipped 3D Y Coordinate")
plt.title("Left vs Right Ankle Y (Smoothed)")
plt.legend()
plt.grid(True)
plt.tight_layout()

plt.show()