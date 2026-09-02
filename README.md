# Basketball AI Analyzer

An AI-powered system for analyzing basketball shooting mechanics using computer vision and pose estimation.

## Features
- Video upload and processing
- Body pose estimation (MediaPipe)
- Automatic shot phase segmentation
- Biomechanical angle calculation
- Form scoring and issue detection
- Improvement recommendations

## Project Structure
- `backend/`: FastAPI server and analysis logic
- `pose_detection/`: Computer vision pose extraction
- `shot_analysis/`: Biomechanics and scoring engine
- `frontend/`: React dashboard (Coming in next phase)

## Setup

### Prerequisites
- Python 3.11+
- FFmpeg (optional, for advanced video processing)

### Backend Installation
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Start the server:
   ```bash
   uvicorn backend.app.main:app --reload
   ```

## How It Works
1. **Pose Detection**: Uses MediaPipe to extract 33 body landmarks.
2. **Angle Calculation**: Computes key joint angles (knees, elbows, torso).
3. **Shot Segmentation**: Heuristics identify loading, takeoff, and release phases.
4. **Scoring**: Compares metrics against biomechanical ideals.
5. **Recommendations**: Generates actionable feedback for the player.
