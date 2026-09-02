from typing import List, Dict, Any

class BiomechanicsAnalyzer:
    """
    Calculates detailed physical metrics for a detected shot.
    """
    def analyze_shot(self, shot_data: List[Dict[str, Any]], phases: Dict[str, int]) -> Dict[str, Any]:
        metrics = {
            "max_knee_flexion": 180.0,
            "release_elbow_angle": 0.0,
            "torso_angle_loading": 0.0,
            "symmetry_score": 100.0,
            "jump_height_est": 0.0
        }
        
        frame_map = {f["frame"]: f for f in shot_data}
        
        # Analyze Loading Phase
        load_f = phases.get("loading")
        if load_f in frame_map:
            angles = frame_map[load_f].get("angles", {})
            l_knee = angles.get("left_knee", 180.0)
            r_knee = angles.get("right_knee", 180.0)
            metrics["max_knee_flexion"] = round((l_knee + r_knee) / 2, 1)
            metrics["symmetry_score"] = round(100 - abs(l_knee - r_knee), 1)
            metrics["torso_angle_loading"] = round(angles.get("right_torso", 0.0), 1)
            
        # Analyze Release Phase
        rel_f = phases.get("release")
        if rel_f in frame_map:
            angles = frame_map[rel_f].get("angles", {})
            # Get max elbow extension (highest angle)
            metrics["release_elbow_angle"] = round(max(angles.get("right_elbow", 0), angles.get("left_elbow", 0)), 1)
            
        return metrics
