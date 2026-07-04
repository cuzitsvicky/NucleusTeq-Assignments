from fastapi import APIRouter, Depends, Query

from ..schemas import (
    FeedbackSubmitRequest,
    InterviewCreateRequest,
    InterviewResponse,
    PaginatedResponse,
)
from ..services import interview_service
from .auth import check_password_reset
from ..exceptions import ForbiddenException


router = APIRouter()


@router.post("/schedule")
async def schedule_interview(
    interview: InterviewCreateRequest, current_user: dict = Depends(check_password_reset)
):
    if current_user["role"] not in ["Admin", "HR"]:
        raise ForbiddenException("Not authorized")
    interview_id = await interview_service.schedule_interview(
        interview.model_dump(), current_user["email"]
    )
    return {"message": "Interview scheduled", "id": interview_id}


@router.get("/", response_model=PaginatedResponse[InterviewResponse])
async def get_interviews(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(check_password_reset),
):
    return await interview_service.get_interviews(
        current_user["role"],
        current_user["email"],
        page=page,
        limit=limit,
    )


@router.post("/{interview_id}/feedback")
async def submit_feedback(
    interview_id: str,
    feedback: FeedbackSubmitRequest,
    current_user: dict = Depends(check_password_reset),
):
    if current_user["role"] != "Interviewer":
        raise ForbiddenException("Only interviewers can submit feedback")

    await interview_service.submit_feedback(
        interview_id, feedback.model_dump(), current_user["email"]
    )
    return {"message": "Feedback submitted successfully"}
