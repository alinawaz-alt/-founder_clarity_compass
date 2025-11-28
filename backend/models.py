from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Any, Literal, Dict
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, values=None):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema, handler):
        return {"type": "string"}

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    company_size: Literal["15-35", "36-60", "61-95", "96-200"]

class User(UserCreate):
    id: Optional[str] = Field(None, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
        json_schema_extra = {
            "example": {
                "name": "Jane Doe",
                "email": "jane@example.com",
                "company_size": "36-60"
            }
        }

class Answer(BaseModel):
    question_id: str
    response: Any

class Report(BaseModel):
    mindset_shift: str
    operational_focus: str
    next_move: str
    cta_type: Literal["consult", "join_list"]
    full_report_text: str

class SessionCreate(BaseModel):
    user_id: str

class Session(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    session_uuid: str
    answers: List[Answer] = []
    report: Optional[Report] = None
    status: Literal["started", "completed"] = "started"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class DiagnosticStartResponse(BaseModel):
    session_id: str
    user_id: str

class DiagnosticCompleteRequest(BaseModel):
    answers: List[Answer]
    email: Optional[EmailStr] = None

class TrackingEventCreate(BaseModel):
    session_id: str
    event_type: str
    metadata: Dict[str, Any] = {}
    timestamp: datetime = Field(default_factory=datetime.utcnow)