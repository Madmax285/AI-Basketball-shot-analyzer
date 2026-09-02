import cv2
import mediapipe as mp
import numpy as np
from typing import List, Dict, Any, Optional
from .angle_calculator import get_body_angles

class PoseDetector:
    def __init__(self, static_mode=False, model_complexity=1, smooth_landmarks=True, 
                 min_detection_confidence=0.5, min_tracking_confidence=0.5):
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=static_mode,
            model_complexity=model_complexity,
            smooth_landmarks=smooth_landmarks,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence
        )
        self.mp_draw = mp.solutions.drawing_utils
        
        # Mapping indices to names
        self.landmark_map = {
            11: 'left_shoulder', 12: 'right_shoulder',
            13: 'left_elbow', 14: 'right_elbow',
            15: 'left_wrist', 16: 'right_wrist',
            23: 'left_hip', 24: 'right_hip',
            25: 'left_knee', 26: 'right_knee',
            27: 'left_ankle', 28: 'right_ankle',
            31: 'left_foot_index', 32: 'right_foot_index'
        }

    def process_video(self, video_path: str, sample_rate: int = 1) -> List[Dict[str, Any]]:
        """
        Processes a video file and returns a list of pose data per frame.
        """
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Could not open video: {video_path}")
            
        results_data = []
        frame_count = 0
        
        fps = cap.get(cv2.CAP_PROP_FPS)
        
        while cap.isOpened():
            success, frame = cap.read()
            if not success:
                break
                
            if frame_count % sample_rate == 0:
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                results = self.pose.process(frame_rgb)
                
                frame_data = {
                    "frame": frame_count,
                    "timestamp": frame_count / fps if fps > 0 else 0,
                    "landmarks": {},
                    "angles": {},
                    "confidence": 0.0
                }
                
                if results.pose_landmarks:
                    landmarks_dict = {}
                    confidences = []
                    for idx, name in self.landmark_map.items():
                        lm = results.pose_landmarks.landmark[idx]
                        landmarks_dict[name] = [lm.x, lm.y, lm.visibility]
                        confidences.append(lm.visibility)
                    
                    frame_data["landmarks"] = landmarks_dict
                    frame_data["angles"] = get_body_angles(landmarks_dict)
                    frame_data["confidence"] = float(np.mean(confidences))
                
                results_data.append(frame_data)
                
            frame_count += 1
            
        cap.release()
        return results_data

    def draw_landmarks(self, frame: np.ndarray, landmarks_dict: Dict[str, List[float]]) -> np.ndarray:
        """
        Utility to draw detected landmarks on a frame (for visualization).
        Note: This expects raw landmarks or normalized coords.
        """
        # This is a simplified version; in production we use mp_draw.draw_landmarks
        # with the original Mediapipe results object.
        return frame
