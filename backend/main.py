from fastapi import FastAPI, status, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from .config import settings
from .database import db
from .models import UserCreate, DiagnosticStartResponse, DiagnosticCompleteRequest, Report, TrackingEventCreate
from .services.report_generator import generate_report
from .services.email_service import send_report_email
import uuid
from datetime import datetime
from bson import ObjectId

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        await db.connect_to_database()
    except Exception as e:
        print(f"Failed to connect to MongoDB during startup: {e}")
    yield
    # Shutdown
    await db.close_database_connection()

app = FastAPI(
    title="Founder Clarity Compass API",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/healthz")
async def health_check():
    try:
        if db.client:
            await db.client.admin.command('ping')
            return {"status": "ok", "db": "connected"}
        else:
            return JSONResponse(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                content={"status": "error", "db": "disconnected"}
            )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "error", "db": "disconnected", "details": str(e)}
        )

@app.post("/api/v1/diagnostic/start", response_model=DiagnosticStartResponse, status_code=status.HTTP_201_CREATED)
async def start_diagnostic(user_data: UserCreate):
    if not db.client:
         raise HTTPException(status_code=503, detail="Database not connected")
    
    # 1. Create User
    user_dict = user_data.model_dump()
    user_dict["created_at"] = datetime.utcnow()
    
    # Use 'founder_compass' database
    db_instance = db.client.founder_compass
    
    new_user = await db_instance.users.insert_one(user_dict)
    user_id = str(new_user.inserted_id)
    
    # 2. Create Session
    session_uuid = str(uuid.uuid4())
    session_dict = {
        "user_id": user_id,
        "session_uuid": session_uuid,
        "answers": [],
        "status": "started",
        "created_at": datetime.utcnow()
    }
    await db_instance.sessions.insert_one(session_dict)
    
    return DiagnosticStartResponse(session_id=session_uuid, user_id=user_id)

@app.post("/api/v1/diagnostic/{session_id}/complete", response_model=Report)
async def complete_diagnostic(session_id: str, request: DiagnosticCompleteRequest, background_tasks: BackgroundTasks):
    if not db.client:
        raise HTTPException(status_code=503, detail="Database not connected")
    
    db_instance = db.client.founder_compass
    
    # 1. Find Session
    session = await db_instance.sessions.find_one({"session_uuid": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    # 2. Find User (to get company size for report)
    try:
        user = await db_instance.users.find_one({"_id": ObjectId(session["user_id"])})
    except:
         raise HTTPException(status_code=404, detail="Invalid User ID associated with session")

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 3. Generate Report
    report = generate_report(user["company_size"], request.answers)
    
    # 4. Update Session
    update_data = {
        "answers": [a.model_dump() for a in request.answers],
        "report": report.model_dump(),
        "status": "completed",
        "completed_at": datetime.utcnow()
    }
    
    await db_instance.sessions.update_one(
        {"session_uuid": session_id},
        {"$set": update_data}
    )

    # 5. Send Email (if provided)
    if request.email:
        background_tasks.add_task(send_report_email, request.email, report.model_dump())
    
    return report

@app.post("/api/v1/tracking/event", status_code=status.HTTP_201_CREATED)
async def track_event(event_data: TrackingEventCreate):
    if not db.client:
        raise HTTPException(status_code=503, detail="Database not connected")
    
    db_instance = db.client.founder_compass
    
    event_dict = event_data.model_dump()
    # Ensure timestamp is saved as a datetime object if it isn't already (Pydantic handles parsing usually)
    
    await db_instance.events.insert_one(event_dict)
    
    return {"status": "recorded"}