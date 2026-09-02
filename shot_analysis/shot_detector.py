from typing import List, Dict, Any, Optional
import numpy as np

class ShotDetector:
    """
    Analyzes pose history to detect shooting motions and segment phases.
    """
    def __init__(self, fps: float = 30.0):
        self.fps = fps
        self.vertical_threshold = 0.02
        self.knee_flexion_threshold = 150.0
        
    def detect_shots(self, pose_history: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Identifies shot attempts in a sequence of pose data.
        Returns a list of shot metadata including phase frame indices.
        """
        if not pose_history or len(pose_history) < 15:
            return []
            
        # Extract vertical movement of key points (hips and wrists)
        hip_y = []
        wrist_y = []
        
        for frame in pose_history:
            lms = frame.get("landmarks", {})
            if "right_hip" in lms and "left_hip" in lms:
                hip_y.append((lms["right_hip"][1] + lms["left_hip"][1]) / 2)
            else:
                hip_y.append(None)
                
            if "right_wrist" in lms:
                wrist_y.append(lms["right_wrist"][1])
            else:
                wrist_y.append(None)
        
        # Simple heuristic for MVP:
        # A shot usually consists of a "dip" (loading) followed by a peak (release)
        # For now, we segment the entire video as one shot if motion is detected
        
        shots = []
        if any(h is not None for h in hip_y):
            # Find phase frame indices
            phases = self._segment_phases(pose_history, hip_y, wrist_y)
            
            shot = {
                "shot_id": 1,
                "start_frame": pose_history[0]["frame"],
                "end_frame": pose_history[-1]["frame"],
                "phases": phases
            }
            shots.append(shot)
            
        return shots

    def _segment_phases(self, pose_history: List[Dict[str, Any]], hip_y: list, wrist_y: list) -> Dict[str, int]:
        """
        Heuristic approximation of shooting phases based on movement.
        """
        frames = [f["frame"] for f in pose_history]
        
        # Loading: Lowest point of hips
        valid_hips = [(i, y) for i, y in enumerate(hip_y) if y is not None]
        if valid_hips:
            loading_idx = max(valid_hips, key=lambda x: x[1])[0] # Max Y is lowest in image coords
        else:
            loading_idx = int(len(frames) * 0.3)
            
        # Release: Peak of wrist height during upward motion
        valid_wrists = [(i, y) for i, y in enumerate(wrist_y) if y is not None and i > loading_idx]
        if valid_wrists:
            release_idx = min(valid_wrists, key=lambda x: x[1])[0] # Min Y is highest
        else:
            release_idx = int(len(frames) * 0.7)
            
        return {
            "preparation": frames[0],
            "loading": frames[loading_idx],
            "takeoff": frames[int((loading_idx + release_idx) / 2)],
            "release": frames[release_idx],
            "landing": frames[-1]
        }
