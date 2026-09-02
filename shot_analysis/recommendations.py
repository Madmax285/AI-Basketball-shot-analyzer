from typing import List, Dict, Any

class RecommendationEngine:
    def get_recommendations(self, metrics: Dict[str, Any], scores: Dict[str, float]) -> List[Dict[str, Any]]:
        recs = []
        
        if scores["lower_body_score"] < 80:
            recs.append({
                "issue": "Knee Flexion",
                "severity": "medium",
                "metric": "Max Knee Flexion",
                "value": metrics["max_knee_flexion"],
                "recommendation": "Try to load more power through your legs by bending your knees to approximately 115 degrees."
            })
            
        if scores["upper_body_score"] < 80:
            recs.append({
                "issue": "Arm Extension",
                "severity": "high",
                "metric": "Release Elbow Angle",
                "value": metrics["release_elbow_angle"],
                "recommendation": "Focus on full arm extension at the point of release for a higher release point."
            })
            
        if not recs:
            recs.append({
                "issue": "None",
                "severity": "low",
                "metric": "N/A",
                "value": 0,
                "recommendation": "Great form! Maintain consistency through practice."
            })
            
        return recs
