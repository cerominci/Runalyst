#!/usr/bin/env python3
"""
Video frame analyzer using Google MediaPipe for human detection.
Analyzes video frames, marks presence/absence of humans, and crops to longest human sequence.
"""

import cv2
import numpy as np
from pathlib import Path
from typing import List, Tuple
import sys

# Import MediaPipe correctly for v0.10.x and newer Python versions
import mediapipe as mp


class VideoHumanDetector:
    def __init__(self, confidence_threshold: float = 0.5):
        """
        Initialize the video human detector using MediaPipe Pose.

        Args:
            confidence_threshold: Minimum confidence score for detecting humans
        """
        self.confidence_threshold = confidence_threshold

        # Initialize MediaPipe Pose detection using the 'mp' namespace
        self.pose = mp.solutions.pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            smooth_landmarks=True,
            min_detection_confidence=confidence_threshold,
            min_tracking_confidence=0.5
        )

    def has_human_in_frame(self, frame: np.ndarray) -> bool:
        """
        Detect if frame contains a human using MediaPipe pose detection.

        Args:
            frame: Video frame as numpy array (BGR format)

        Returns:
            True if human detected, False otherwise
        """
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.pose.process(rgb_frame)

        # If pose landmarks are detected, human is present
        if results.pose_landmarks:
            return True
        return False

    def analyze_video(self, video_path: str) -> Tuple[List[bool], float, int]:
        """
        Analyze all frames in video for human presence.

        Args:
            video_path: Path to video file

        Returns:
            Tuple of (human_indicators, fps, frame_count)
        """
        cap = cv2.VideoCapture(video_path)

        if not cap.isOpened():
            raise ValueError(f"Cannot open video file: {video_path}")

        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        human_indicators = []
        frame_idx = 0

        print(f"Analyzing video: {video_path}")
        print(f"Total frames: {frame_count}, FPS: {fps}")

        while True:
            ret, frame = cap.read()

            if not ret:
                break

            # Detect human in frame
            has_human = self.has_human_in_frame(frame)
            human_indicators.append(has_human)

            # Progress indicator
            if (frame_idx + 1) % max(1, frame_count // 10) == 0:
                progress = ((frame_idx + 1) / frame_count) * 100
                print(f"Processed {frame_idx + 1}/{frame_count} frames ({progress:.1f}%)...")

            frame_idx += 1

        cap.release()

        print(f"Analysis complete. Found {sum(human_indicators)}/{len(human_indicators)} frames with humans")
        return human_indicators, fps, frame_count

    def find_longest_sequence(self, indicators: List[bool]) -> Tuple[int, int]:
        """
        Find the longest continuous sequence of True values in the indicators array.

        Args:
            indicators: List of boolean values

        Returns:
            Tuple of (start_index, end_index) for longest sequence
        """
        max_start = 0
        max_length = 0
        current_start = 0
        current_length = 0

        for i, indicator in enumerate(indicators):
            if indicator:
                if current_length == 0:
                    current_start = i
                current_length += 1
            else:
                if current_length > max_length:
                    max_length = current_length
                    max_start = current_start
                current_length = 0

        # Check the last sequence
        if current_length > max_length:
            max_length = current_length
            max_start = current_start

        end_index = max_start + max_length - 1

        print(f"\nLongest human sequence:")
        print(f"  Start frame: {max_start}")
        print(f"  End frame: {end_index}")
        print(f"  Duration: {max_length} frames")

        return max_start, end_index

    def crop_video(self, video_path: str, output_path: str,
                   start_frame: int, end_frame: int) -> int:
        """
        Crop video to specified frame range and save output.

        Args:
            video_path: Input video path
            output_path: Output video path
            start_frame: Starting frame index (inclusive)
            end_frame: Ending frame index (inclusive)

        Returns:
            Number of frames written
        """
        cap = cv2.VideoCapture(video_path)

        if not cap.isOpened():
            raise ValueError(f"Cannot open video file: {video_path}")

        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        # Validate frame indices
        start_frame = max(0, min(start_frame, frame_count - 1))
        end_frame = max(start_frame, min(end_frame, frame_count - 1))

        # Get codec and create VideoWriter
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

        if not out.isOpened():
            raise ValueError(f"Cannot create output video: {output_path}")

        # Seek to start frame
        cap.set(cv2.CAP_PROP_POS_FRAMES, start_frame)

        frames_written = 0
        frame_idx = start_frame

        print(f"\nCropping video...")
        print(f"  Input: {video_path}")
        print(f"  Output: {output_path}")
        print(f"  Frames: {start_frame}-{end_frame} ({end_frame - start_frame + 1} total)")

        while frame_idx <= end_frame:
            ret, frame = cap.read()

            if not ret:
                break

            out.write(frame)
            frames_written += 1
            frame_idx += 1

            if (frames_written) % max(1, (end_frame - start_frame + 1) // 10) == 0:
                progress = (frames_written) / (end_frame - start_frame + 1) * 100
                print(f"  Written {frames_written} frames ({progress:.1f}%)...")

        cap.release()
        out.release()

        print(f"✓ Video cropped successfully! Output: {output_path}")
        return frames_written

    def cleanup(self):
        """Clean up resources."""
        self.pose.close()


def main():
    """Main execution function."""
    # Get video path from argument or use default
    if len(sys.argv) > 1:
        video_path = sys.argv[1]
    else:
        # Look for video file in current directory
        current_dir = Path('.')
        video_files = list(current_dir.glob('*.mp4')) + list(current_dir.glob('*.mov')) + \
                      list(current_dir.glob('*.avi')) + list(current_dir.glob('*.mkv'))

        if video_files:
            video_path = str(video_files[0])
        else:
            print("Usage: python video_human_detector.py <video_path>")
            print("\nNo video file found in current directory.")
            sys.exit(1)

    # Validate input file
    if not Path(video_path).exists():
        print(f"Error: Video file not found: {video_path}")
        sys.exit(1)

    # Initialize detector
    detector = VideoHumanDetector(confidence_threshold=0.5)

    try:
        # Analyze video
        human_indicators, fps, frame_count = detector.analyze_video(video_path)

        # Find longest sequence
        start_frame, end_frame = detector.find_longest_sequence(human_indicators)

        # --- YENİ EKLENEN KISIM: Baştan ve sondan 10'ar frame kırpma ---
        margin = 10
        sequence_length = end_frame - start_frame + 1

        if sequence_length > (margin * 2):  # Sadece kırpmaya yetecek kadar frame varsa yap
            start_frame += margin
            end_frame -= margin
            print(f"\nGüvenlik payı uygulandı: Baştan ve sondan {margin} frame kırpıldı.")
            print(f"Yeni aralık: {start_frame} - {end_frame}")
        else:
            print(f"\nUyarı: Sekans çok kısa ({sequence_length} frame), kenar kırpması yapılamadı.")
        # ---------------------------------------------------------------

        if end_frame - start_frame + 1 <= 50:
            print("\nNot enough frames with humans detected!")
            print("Using entire video as fallback.")
            start_frame = 0
            end_frame = frame_count - 1

        # Generate output path
        input_path = Path(video_path)
        output_path = input_path.parent / f"{input_path.stem}_human_segment{input_path.suffix}"

        # Crop and save
        frames_written = detector.crop_video(video_path, str(output_path), start_frame, end_frame)

        # Print summary
        duration = frames_written / fps if fps > 0 else 0
        print(f"\n{'=' * 50}")
        print(f"Summary:")
        print(f"  Input video: {video_path}")
        print(f"  Output video: {output_path}")
        print(f"  Frames processed: {len(human_indicators)}")
        print(f"  Frames with humans: {sum(human_indicators)}")
        print(f"  Longest human sequence: {end_frame - start_frame + 1} frames")
        print(f"  Output duration: {duration:.2f} seconds")
        print(f"{'=' * 50}")

    finally:
        detector.cleanup()


if __name__ == "__main__":
    main()