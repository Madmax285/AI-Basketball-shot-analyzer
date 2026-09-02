from typing import List, Dict, Any

class RecommendationEngine:
    """
    Generates actionable feedback based on detected mechanics.
    """
    def get_recommendations(self, metrics: Dict[str, Any], scores: Dict[str, float]) -> List[Dict[str, Any]]:
        recs = []
        
        # Lower Body Checks
        if metrics["max_knee_flexion"] > 140:
            recs.append({
                "issue": "Insufficient Knee Bend",
                "severity": "medium",
                "metric": "Max Knee Flexion",
                "value": metrics["max_knee_flexion"],
                "recommendation": "Try to load more power through your legs by bending your knees deeper (target ~115°)."
            })
        elif metrics["max_knee_flexion"] < 90:
            recs.append({
                "issue": "Excessive Knee Flexion",
                "severity": "low",
                "metric": "Max Knee Flexion",
                "value": metrics["max_knee_flexion"],
                "recommendation": "You may be dipping too low, which can slow down your shot release. Try a more moderate bend."
            })
            
        # Upper Body Checks
        if metrics["release_elbow_angle"] < 150:
            recs.append({
                "issue": "Poor Arm Extension",
                "severity": "high",
                "metric": "Release Elbow Angle",
                "value": metrics["release_elbow_angle"],
                "recommendation": "Focus on full arm extension at the peak of your shot for a higher release point and better arc."
            })
            
        # Symmetry Checks
        if metrics["symmetry_score"] < 85:
            recs.append({
                "issue": "Leg Imbalance",
                "severity": "medium",
                "metric": "Symmetry Score",
                "value": metrics["symmetry_score"],
                "recommendation": "Your knee bend is uneven. Work on distributing weight equally between both legs for better stability."
            })
            
        if not recs:
            recs.append({
                "issue": "None Detected",
                "severity": "low",
                "metric": "Overall Mechanics",
                "value": scores["overall_score"],
                "recommendation": "Great form! Maintain this consistency through repetitive practice."
            })
            
        return recs
