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
from shot_analysis.recommendations import RecommendationEngine

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store (move to DB in Phase 11)
analysis_sessions = {}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "app": settings.APP_NAME}

@app.post("/api/analyze")
async def analyze_video(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.filename.endswith(('.mp4', '.mov', '.avi')):
        raise HTTPException(status_code=400, detail="Unsupported video format")
        
    session_id = str(uuid.uuid4())
    file_path = os.path.join(settings.UPLOAD_DIR, f"{session_id}_{file.filename}")
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    analysis_sessions[session_id] = {
        "id": session_id,
        "status": "processing",
        "filename": file.filename
    }
    
    # Start background processing pipeline
    background_tasks.add_task(run_analysis_pipeline, session_id, file_path)
    
    return {"session_id": session_id, "status": "queued"}

@app.get("/api/analysis/{session_id}")
async def get_analysis(session_id: str):
    if session_id not in analysis_sessions:
        raise HTTPException(status_code=404, detail="Analysis session not found")
    return analysis_sessions[session_id]

def run_analysis_pipeline(session_id: str, video_path: str):
    """
    The core analysis pipeline.
    """
    try:
        logger.info(f"Starting analysis for session: {session_id}")
        
        # 1. Pose Detection
        detector = PoseDetector(min_detection_confidence=settings.POSE_CONFIDENCE_THRESHOLD)
        pose_history = detector.process_video(video_path, sample_rate=settings.PROCESS_EVERY_N_FRAMES)
        
        # 2. Shot Segmentation
        shot_detector = ShotDetector()
        shots = shot_detector.detect_shots(pose_history)
        
        results = []
        if shots:
            # 3. Analyze the first shot for MVP
            shot = shots[0]
            analyzer = BiomechanicsAnalyzer()
            metrics = analyzer.analyze_shot(pose_history, shot["phases"])
            
            # 4. Scoring
            scorer = FormScorer()
            scores = scorer.calculate_score(metrics)
            
            # 5. Recommendations
            rec_engine = RecommendationEngine()
            recs = rec_engine.get_recommendations(metrics, scores)
            
            results = {
                "overall_score": scores["overall_score"],
                "scores": scores,
                "metrics": metrics,
                "recommendations": recs,
                "shot_count": len(shots)
            }
            
            analysis_sessions[session_id].update({
                "status": "completed",
                "result": results
            })
        else:
            analysis_sessions[session_id].update({
                "status": "failed",
                "error": "No clear shooting motion detected."
            })
            
    except Exception as e:
        logger.error(f"Analysis failed for {session_id}: {str(e)}")
        analysis_sessions[session_id].update({
            "status": "failed",
            "error": str(e)
        })
