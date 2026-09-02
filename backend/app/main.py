from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import os
import uuid
import shutil
from .config import settings
from pose_detection.pose_detector import PoseDetector
from shot_analysis.shot_detector import ShotDetector
from shot_analysis.biomechanics import BiomechanicsAnalyzer
from shot_analysis.form_scoring import FormScorer
from shot_analysis.recommendations import RecommendationEngine

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Analysis in-memory store (for MVP, will move to DB next)
analyses = {}

@app.post("/api/analyze")
async def analyze_video(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.filename.endswith(('.mp4', '.mov', '.avi')):
        raise HTTPException(status_code=400, detail="Invalid video format")
        
    analysis_id = str(uuid.uuid4())
    file_path = os.path.join(settings.UPLOAD_DIR, f"{analysis_id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    analyses[analysis_id] = {"status": "processing", "id": analysis_id}
    
    background_tasks.add_task(run_analysis_pipeline, analysis_id, file_path)
    
    return {"analysis_id": analysis_id, "status": "queued"}

@app.get("/api/analysis/{analysis_id}")
async def get_analysis(analysis_id: str):
    if analysis_id not in analyses:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analyses[analysis_id]

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

def run_analysis_pipeline(analysis_id: str, video_path: str):
    try:
        # 1. Pose Detection
        detector = PoseDetector()
        pose_history = detector.process_video(video_path)
        
        # 2. Shot Detection
        shot_detector = ShotDetector()
        shots = shot_detector.detect_shots(pose_history)
        
        # 3. Analysis for the first shot
        if shots:
            shot = shots[0]
            analyzer = BiomechanicsAnalyzer()
            metrics = analyzer.analyze_shot(pose_history, shot["phases"])
            
            scorer = FormScorer()
            scores = scorer.calculate_score(metrics)
            
            rec_engine = RecommendationEngine()
            recs = rec_engine.get_recommendations(metrics, scores)
            
            analyses[analysis_id] = {
                "status": "completed",
                "id": analysis_id,
                "overall_score": scores["overall_score"],
                "scores": scores,
                "metrics": metrics,
                "recommendations": recs,
                "shot_count": len(shots)
            }
        else:
            analyses[analysis_id] = {
                "status": "failed",
                "id": analysis_id,
                "error": "No shooting motion detected"
            }
            
    except Exception as e:
        analyses[analysis_id] = {
            "status": "failed",
            "id": analysis_id,
            "error": str(e)
        }
