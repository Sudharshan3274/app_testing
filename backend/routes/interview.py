from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from services.ai_service import analyze_interview_with_ai

router = APIRouter()


class InterviewAnalysisRequest(BaseModel):
    domain: str
    questions: List[str]
    answers: List[str]
    timePerQuestion: List[float] = []
    eyeContactScore: float = 0
    recordedQuestions: List[bool] = []


@router.post("/analyze")
async def analyze_interview(request: InterviewAnalysisRequest):
    """AI-powered interview analysis endpoint."""
    data = {
        "domain": request.domain,
        "questions": request.questions,
        "answers": request.answers,
        "timePerQuestion": request.timePerQuestion,
        "eyeContactScore": request.eyeContactScore,
        "recordedQuestions": request.recordedQuestions,
    }
    result = await analyze_interview_with_ai(data)
    return result
