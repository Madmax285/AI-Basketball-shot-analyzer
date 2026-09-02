from typing import List, Dict, Any, Optional
import numpy as np

class ShotDetector:
    """
    Heuristic-based shot detection and phase segmentation.
    """
    def __init__(self, fps: float = 30.0):
        self.fps = fps
        # Thresholds for movement (normalized coordinates)
        self.vertical_move_threshold = 0.01 
        self.knee_flexion_threshold = 140.0 # Degrees
        
    def detect_shots(self, pose_history: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Analyzes pose sequences to identify shot attempts.
        Returns segments with phase metadata.
        """
        if not pose_history:
            return []
            
        # Simplified shot detection: 
        # Look for a significant dip (loading) followed by upward motion (takeoff/release)
        # In a real app, this would be a sliding window or a trained LSTM
        
        shots = []
        # For MVP, treat the whole video as one shot if motion is detected
        # or implement basic peak detection on vertical wrist/hip movement
        
        # Extract vertical movement of hips/shoulders
        vertical_pos = []
        for frame in pose_history:
            lms = frame.get("landmarks", {})
            if "left_hip" in lms and "right_hip" in lms:
                avg_y = (lms["left_hip"][1] + lms["right_hip"][1]) / 2
                vertical_pos.append(avg_y)
            else:
                vertical_pos.append(None)
                
        # Basic shot detection logic (stub for MVP)
        # We assume 1 shot per video for the initial implementation
        if len(pose_history) > 10:
            shot = {
                "shot_id": 1,
                "start_frame": 0,
                "end_frame": len(pose_history) - 1,
                "phases": self._segment_phases(pose_history)
            }
            shots.append(shot)
            
        return shots

    def _segment_phases(self, pose_history: List[Dict[str, Any]]) -> Dict[str, int]:
        """
        Identifies frame indices for each shooting phase.
        """
        # Heuristics:
        # Preparation: Start of motion
        # Loading: Max knee flexion (lowest point)
        # Takeoff: Knees extending, hips moving up
        # Release: Max arm extension near peak height
        # Landing: Hips moving down, feet returning to ground
        
        # This is a heuristic approximation
        frames = [f["frame"] for f in pose_history]
        mid = len(frames) // 2
        
        return {
            "preparation": frames[0],
            "loading": frames[int(len(frames) * 0.3)],
            "takeoff": frames[int(len(frames) * 0.5)],
            "release": frames[int(len(frames) * 0.6)],
            "landing": frames[int(len(frames) * 0.8)],
            "follow_through": frames[int(len(frames) * 0.9)]
        }
