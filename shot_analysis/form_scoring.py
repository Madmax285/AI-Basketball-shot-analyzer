from typing import Dict, Any

class FormScorer:
    """
    Calculates weighted form scores based on biomechanical metrics.
    """
    def __init__(self):
        # Configurable weights as per requirements
        self.weights = {
            "lower_body": 0.20,
            "upper_body": 0.30,
            "alignment": 0.20,
            "release": 0.20,
            "consistency": 0.10
        }
        
    def calculate_score(self, metrics: Dict[str, Any]) -> Dict[str, float]:
        # Lower Body: Ideal knee flexion around 110-120 degrees
        knee_flex = metrics.get("max_knee_flexion", 180)
        lower_score = 100 - min(abs(knee_flex - 115), 60) * 1.5
        
        # Upper Body: Elbow extension near release should be 150-175
        elbow_ang = metrics.get("release_elbow_angle", 90)
        upper_score = 100 - min(abs(elbow_ang - 165), 50) * 2
        
        # Alignment: Symmetry of knees
        alignment_score = metrics.get("symmetry_score", 100)
        
        # Release Mechanics: Placeholder for MVP
        release_score = 80.0
        
        # Consistency: Placeholder for MVP (needs multiple shots)
        consistency_score = 85.0
        
        overall = (
            lower_score * self.weights["lower_body"] +
            upper_score * self.weights["upper_body"] +
            alignment_score * self.weights["alignment"] +
            release_score * self.weights["release"] +
            consistency_score * self.weights["consistency"]
        )
        
        return {
            "overall_score": round(overall, 1),
            "lower_body_score": round(lower_score, 1),
            "upper_body_score": round(upper_score, 1),
            "alignment_score": round(alignment_score, 1),
            "release_score": round(release_score, 1),
            "consistency_score": round(consistency_score, 1)
        }
