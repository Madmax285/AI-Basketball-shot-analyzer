import numpy as np
from typing import Tuple, List

def calculate_angle(a: Tuple[float, float], b: Tuple[float, float], c: Tuple[float, float]) -> float:
    """
    Calculates the angle at point b (the vertex) given three points a, b, and c.
    Points are (x, y) coordinates. Returns angle in degrees.
    """
    a = np.array(a) # First point
    b = np.array(b) # Mid point (vertex)
    c = np.array(c) # End point

    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)

    if angle > 180.0:
        angle = 360 - angle

    return angle

def get_body_angles(landmarks: dict) -> dict:
    """
    Calculates key basketball biomechanics angles from pose landmarks.
    """
    angles = {}
    
    # Required points for Elbow (Shoulder -> Elbow -> Wrist)
    if all(k in landmarks for k in ['right_shoulder', 'right_elbow', 'right_wrist']):
        angles['right_elbow'] = calculate_angle(
            landmarks['right_shoulder'][:2], 
            landmarks['right_elbow'][:2], 
            landmarks['right_wrist'][:2]
        )
        
    if all(k in landmarks for k in ['left_shoulder', 'left_elbow', 'left_wrist']):
        angles['left_elbow'] = calculate_angle(
            landmarks['left_shoulder'][:2], 
            landmarks['left_elbow'][:2], 
            landmarks['left_wrist'][:2]
        )

    # Required points for Knee (Hip -> Knee -> Ankle)
    if all(k in landmarks for k in ['right_hip', 'right_knee', 'right_ankle']):
        angles['right_knee'] = calculate_angle(
            landmarks['right_hip'][:2], 
            landmarks['right_knee'][:2], 
            landmarks['right_ankle'][:2]
        )
        
    if all(k in landmarks for k in ['left_hip', 'left_knee', 'left_ankle']):
        angles['left_knee'] = calculate_angle(
            landmarks['left_hip'][:2], 
            landmarks['left_knee'][:2], 
            landmarks['left_ankle'][:2]
        )
        
    # Torso angle (Shoulder -> Hip -> Knee)
    if all(k in landmarks for k in ['right_shoulder', 'right_hip', 'right_knee']):
        angles['right_torso'] = calculate_angle(
            landmarks['right_shoulder'][:2],
            landmarks['right_hip'][:2],
            landmarks['right_knee'][:2]
        )

    return angles
