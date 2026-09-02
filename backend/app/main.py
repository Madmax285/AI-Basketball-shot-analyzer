
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import os
import uuid
import shutil
import logging
from .config import settings
from pose_detection.pose_detector import PoseDetector
from shot_analysis.shot_detector import ShotDetector
from shot_analysis.biomechanics import BiomechanicsAnalyzer
from shot_analysis.form_scoring import FormScorer
from shot_analysis.shot_classifier import ShotClassifier
from shot_analysis.shot_location import ShotLocationAnalyzer
from shot_analysis.result_detector import ShotResultDetector
from shot_analysis.foul_detector import FoulDetector
from shot_analysis.violation_detector import ViolationDetector
from shot_analysis.recommendations import RecommendationEngine

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Basketball AI Video Analyzer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store
analysis_sessions = {}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "app": "Basketball AI Video Analyzer"}

@app.post("/api/analyze")
async def analyze_video(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.filename.lower().endswith(('.mp4', '.mov', '.avi', '.jpg', '.jpeg')):
        raise HTTPException(status_code=400, detail="Unsupported file format.")
        
    session_id = str(uuid.uuid4())
    file_path = os.path.join(settings.UPLOAD_DIR, f"{session_id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    analysis_sessions[session_id] = {
        "id": session_id,
        "status": "processing",
        "filename": file.filename,
        "is_image": file.filename.lower().endswith(('.jpg', '.jpeg'))
    }
    
    background_tasks.add_task(run_full_analysis_pipeline, session_id, file_path)
    
    return {"session_id": session_id, "status": "queued"}

@app.get("/api/analysis/{session_id}")
async def get_analysis(session_id: str):
    if session_id not in analysis_sessions:
        raise HTTPException(status_code=404, detail="Analysis session not found")
    return analysis_sessions[session_id]

def run_full_analysis_pipeline(session_id: str, video_path: str):
    """
    Enhanced analysis pipeline for Video Intelligence.
    """
    try:
        logger.info(f"Starting Video Intelligence Pipeline: {session_id}")
        is_image = video_path.lower().endswith(('.jpg', '.jpeg'))
        
        # 1. Pose & Object Detection (Combined Extraction)
        detector = PoseDetector(min_detection_confidence=settings.POSE_CONFIDENCE_THRESHOLD)
        pose_history = detector.process_video(video_path, sample_rate=settings.PROCESS_EVERY_N_FRAMES)
        
        # 2. Shot Segmentation
        shot_detector = ShotDetector()
        shots = [{ "shot_id": 1, "start_frame": 0, "end_frame": 0, "phases": {"release": 0} }] if is_image else shot_detector.detect_shots(pose_history)
        
        if shots:
            shot = shots[0]
            
            # 3. Biomechanics
            analyzer = BiomechanicsAnalyzer()
            metrics = analyzer.analyze_shot(pose_history, shot["phases"])
            
            # 4. Action Classification
            classifier = ShotClassifier()
            action = classifier.classify_action(pose_history, metrics)
            
            # 5. Location Analysis
            loc_analyzer = ShotLocationAnalyzer()
            location = loc_analyzer.analyze_location(pose_history[shot["phases"]["release"]] if "release" in shot["phases"] else pose_history[0])
            
            # 6. Result Detection
            result_detector = ShotResultDetector()
            result_data = result_detector.detect_result(pose_history)
            
            # 7. Rules & Fouls
            foul_detector = FoulDetector()
            violation_detector = ViolationDetector()
            foul_data = foul_detector.analyze_foul(pose_history)
            violation_data = violation_detector.analyze_violation(pose_history)
            
            # 8. Scoring & Recs
            scorer = FormScorer()
            scores = scorer.calculate_score(metrics)
            rec_engine = RecommendationEngine()
            recs = rec_engine.get_recommendations(metrics, scores)
            
            final_result = {
                "overall_score": scores["overall_score"],
                "action": action,
                "location": location,
                "result": result_data,
                "foul_analysis": foul_data,
                "violation_analysis": violation_data,
                "metrics": metrics,
                "scores": scores,
                "recommendations": recs,
                "play_status": "LIKELY LEGAL" if not violation_data["violation_detected"] else "REVIEW REQUIRED"
            }
            
            analysis_sessions[session_id].update({
                "status": "completed",
                "result": final_result
            })
        else:
            analysis_sessions[session_id].update({"status": "failed", "error": "No actions detected."})
            
    except Exception as e:
        logger.error(f"Pipeline failure: {str(e)}")
        analysis_sessions[session_id].update({"status": "failed", "error": str(e)})
