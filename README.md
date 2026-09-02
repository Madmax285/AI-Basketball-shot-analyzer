# Basketball AI Analyzer 🏀

An AI-powered performance analysis system that uses computer vision to evaluate basketball shooting mechanics.

## 🚀 Overview

The Basketball AI Analyzer identifies key biomechanical markers during a basketball shot. It provides a comprehensive breakdown of your shooting form, including joint angles, phase timing, and actionable recommendations for improvement.

## 🛠 Features

- **Pose Estimation**: Real-time human pose tracking via MediaPipe.
- **Biomechanical Metrics**: Precise measurement of knee flexion, elbow extension, and torso alignment.
- **Shot Segmentation**: Automatic identification of loading, takeoff, and release phases.
- **Form Scoring**: Weighted evaluation system (Lower Body, Upper Body, Alignment).
- **Intelligent Recommendations**: Heuristic-based feedback to correct common form issues.

## 🏗 Technology Stack

- **Backend**: Python 3.11, FastAPI
- **CV/ML**: OpenCV, MediaPipe, NumPy
- **Frontend**: React, Next.js (Planned)
- **Database**: SQLite (Planned)

## 📁 Project Structure

```text
basketball-ai-analyzer/
├── backend/            # FastAPI server and analysis pipeline
├── pose_detection/     # MediaPipe pose extraction and geometry
├── shot_analysis/      # Heuristics, scoring, and recs
├── requirements.txt    # Python dependencies
└── README.md
```

## 🛠 Installation & Setup

### Prerequisites
- Python 3.11+

### Backend Setup
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Start the FastAPI server:
   ```bash
   uvicorn backend.app.main:app --reload
   ```

## 🧪 Testing
Run the test suite:
```bash
pytest
```

## 📝 Limitations
- Analysis is most accurate from a side-view or 45-degree angle.
- Ball release detection is currently an estimate based on wrist peak height.
- Low light or extremely low resolution may impact pose confidence.

## 👤 Author
Professional Portfolio Project
