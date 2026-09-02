from typing import List, Dict, Any

class BiomechanicsAnalyzer:
    def analyze_shot(self, shot_data: List[Dict[str, Any]], phases: Dict[str, int]) -> Dict[str, Any]:
        """
        Calculates biomechanical metrics for a specific shot attempt.
        """
        metrics = {
            "max_knee_flexion": 180.0,
            "release_elbow_angle": 180.0,
            "torso_angle_takeoff": 0.0,
            "symmetry_score": 100.0
        }
        
        # Map frame indices to data
        frame_map = {f["frame"]: f for f in shot_data}
        
        # Knee Flexion at Loading
        loading_frame = phases.get("loading")
        if loading_frame in frame_map:
            angles = frame_map[loading_frame].get("angles", {})
            left = angles.get("left_knee", 180.0)
            right = angles.get("right_knee", 180.0)
            metrics["max_knee_flexion"] = (left + right) / 2
            metrics["symmetry_score"] = 100 - abs(left - right)
            
        # Elbow Angle at Release
        release_frame = phases.get("release")
        if release_frame in frame_map:
            angles = frame_map[release_frame].get("angles", {})
            # Determine shooting arm (usually higher visibility or more flexed)
            left_e = angles.get("left_elbow", 180.0)
            right_e = angles.get("right_elbow", 180.0)
            metrics["release_elbow_angle"] = max(left_e, right_e) # Extension is high angle

        return metrics
