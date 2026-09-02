# Basketball AI Analyzer 🏀

An AI-powered performance analysis system that uses computer vision to evaluate basketball shooting mechanics.

## 🚀 Overview

The Basketball AI Analyzer identifies key biomechanical markers during a basketball shot. It provides a comprehensive breakdown of your shooting form, including joint angles, phase timing, and actionable recommendations for improvement.

## 🏗 Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, Shadcn/UI
- **Backend (Analysis)**: Python 3.11, MediaPipe, OpenCV, NumPy
- **Database/Persistence**: Firebase Cloud Firestore
- **AI Feedback**: Genkit (Google Gemini 2.5 Flash)
- **Charts**: Recharts

## 🛠 Features

- **Pose Estimation**: Real-time 3D human pose tracking.
- **Biomechanical Metrics**: Precise measurement of knee flexion, elbow extension, and torso alignment.
- **Shot Segmentation**: Automatic identification of loading, takeoff, and release phases.
- **AI Coaching**: Natural language form analysis and improvement recommendations.
- **Progress Tracking**: Longitudinal analytics suite to visualize mechanical improvement.

## 📁 Project Structure

```text
basketball-ai-analyzer/
├── src/                # Next.js Application
│   ├── app/            # Frontend routes & layout
│   ├── ai/             # Genkit flows & configuration
│   └── firebase/       # Firestore hooks & config
├── backend/            # Python analysis pipeline
│   ├── pose_detection/ # MediaPipe extraction
│   └── shot_analysis/  # Biomechanics & scoring
├── docs/               # Architecture and backend schemas
└── README.md
```

## 🛠 Installation & Setup

### Frontend
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup (Analysis Pipeline)
1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Start the FastAPI server (Optional, if running local analysis):
   ```bash
   uvicorn backend.app.main:app --reload
   ```

## 🧪 Methodology

The system utilizes a 4-stage pipeline:
1. **Extraction**: MediaPipe Pose identifies 33 joint landmarks.
2. **Kinematics**: Vector geometry calculates joint angles (e.g., Elbow Extension).
3. **Segmentation**: Vertical acceleration triggers identify preparation vs. release.
4. **Heuristics**: Metrics are normalized against elite athlete benchmarks to generate a 0-100 Form Score.

## 📝 Limitations
- Best viewed from a profile (90°) or 45-degree angle.
- High accuracy requires visible joints (avoid baggy clothing).
- Release height is estimated based on wrist peak.

## 👤 Author
Professional Portfolio Project
