from typing import Dict, Any

class FormScorer:
    def __init__(self):
        # Configurable weights
        self.weights = {
            "lower_body": 0.3,
            "upper_body": 0.4,
            "alignment": 0.2,
            "consistency": 0.1
        }
        
    def calculate_score(self, metrics: Dict[str, Any]) -> Dict[str, float]:
        """
        Calculates form scores based on biomechanical metrics.
        """
        # Scoring logic based on common "ideal" ranges
        # e.g. Loading knee angle should be between 100-130
        knee_flex = metrics.get("max_knee_flexion", 180)
        lower_score = 100 - min(abs(knee_flex - 115), 50) * 2
        
        # Release elbow angle should be near 160-180 (extension)
        elbow_ang = metrics.get("release_elbow_angle", 90)
        upper_score = 100 - min(abs(elbow_ang - 170), 50) * 2
        
        alignment_score = metrics.get("symmetry_score", 90)
        consistency_score = 85.0 # Stub for MVP
        
        overall = (
            lower_score * self.weights["lower_body"] +
            upper_score * self.weights["upper_body"] +
            alignment_score * self.weights["alignment"] +
            consistency_score * self.weights["consistency"]
        )
        
        return {
            "overall_score": round(overall, 1),
            "lower_body_score": round(lower_score, 1),
            "upper_body_score": round(upper_score, 1),
            "alignment_score": round(alignment_score, 1),
            "consistency_score": round(consistency_score, 1)
        }
