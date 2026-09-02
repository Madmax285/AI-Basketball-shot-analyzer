
from typing import List, Dict, Any, Optional
import numpy as np

class ShotDetector:
    """
    Analyzes pose history to detect multiple shooting motions and segment phases.
    """
    def __init__(self, fps: float = 30.0):
        self.fps = fps
        self.vertical_threshold = 0.02
        self.min_frames_between_shots = 45 # 1.5 seconds at 30fps
        
    def detect_shots(self, pose_history: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Identifies multiple shot attempts in a sequence of pose data.
        """
        if not pose_history or len(pose_history) < 15:
            return []
            
        wrist_y = []
        for frame in pose_history:
            lms = frame.get("landmarks", {})
            if "right_wrist" in lms:
                wrist_y.append(lms["right_wrist"][1])
            else:
                wrist_y.append(None)
        
        # Simple peak detection for multiple shots
        # A shot is detected when the wrist moves above a certain height
        shots = []
        last_shot_frame = -self.min_frames_between_shots
        
        # Detect peaks in wrist height (low Y value is high physical position)
        for i in range(5, len(wrist_y) - 5):
            curr_y = wrist_y[i]
            if curr_y is not None and curr_y < 0.4: # Simple height threshold
                # Check if it's a local minimum (peak height)
                is_peak = all(wrist_y[j] is None or curr_y <= wrist_y[j] for j in range(i-5, i+6))
                
                if is_peak and (i - last_shot_frame) > self.min_frames_between_shots:
                    shot_id = len(shots) + 1
                    start_frame = max(0, i - 30)
                    end_frame = min(len(pose_history) - 1, i + 15)
                    
                    # Estimate phases for this segment
                    phases = self._segment_phases(pose_history[start_frame:end_frame+1])
                    
                    shots.append({
                        "shot_id": shot_id,
                        "start_frame": start_frame,
                        "end_frame": end_frame,
                        "timestamp": pose_history[i]["timestamp"],
                        "phases": phases
                    })
                    last_shot_frame = i
        
        # Fallback to single shot if none detected by peak but movement exists
        if not shots and any(y is not None for y in wrist_y):
            shots.append({
                "shot_id": 1,
                "start_frame": 0,
                "end_frame": len(pose_history) - 1,
                "timestamp": pose_history[int(len(pose_history)/2)]["timestamp"],
                "phases": self._segment_phases(pose_history)
            })
            
        return shots

    def _segment_phases(self, segment: List[Dict[str, Any]]) -> Dict[str, int]:
        """
        Heuristic approximation of shooting phases within a local segment.
        """
        frames = [f["frame"] for f in segment]
        
        # Release: Peak of wrist height
        wrist_vals = []
        for f in segment:
            lms = f.get("landmarks", {})
            y = lms.get("right_wrist", [None, 1])[1]
            wrist_vals.append(y)
        
        release_idx = wrist_vals.index(min(wrist_vals))
        
        return {
            "preparation": frames[0],
            "loading": frames[max(0, release_idx - 10)],
            "takeoff": frames[max(0, release_idx - 5)],
            "release": frames[release_idx],
            "landing": frames[-1]
        }
