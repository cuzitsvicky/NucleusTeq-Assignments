from fastapi import APIRouter, Depends, Query, status
from ..schemas import (
    FeedbackSubmitRequest,
    InterviewCreateRequest,
    InterviewUpdateRequest,
    InterviewResponse,
    MessageResponse,
    MessageWithIdResponse,
    PaginatedResponse,
)
from ..enums import UserRole
from ..services import interview_service
from ..utils import require_roles
from .auth import check_password_reset


router = APIRouter()

# Endpoint to schedule a new interview
@router.post(
    "/schedule",
    response_model=MessageWithIdResponse,
    status_code=status.HTTP_201_CREATED,
)
async def schedule_interview(interview: InterviewCreateRequest, current_user: dict = Depends(check_password_reset)):
    require_roles(current_user, {UserRole.HR})
    interview_id = await interview_service.schedule_interview(interview.model_dump(), current_user["email"])
    return MessageWithIdResponse(message="Interview scheduled", id=interview_id)


@router.put(
    "/{interview_id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
)
async def update_interview_schedule(
    interview_id: str,
    interview: InterviewUpdateRequest,
    current_user: dict = Depends(check_password_reset),
):
    require_roles(current_user, {UserRole.HR})
    await interview_service.update_interview_schedule(interview_id, interview.model_dump())
    return MessageResponse(message="Interview updated")


# Endpoint to get a list of interviews with optional filters and pagination
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


# Endpoint to submit feedback for a specific interview by an interviewer
@router.post("/{interview_id}/feedback", response_model=MessageResponse)
async def submit_feedback(
    interview_id: str,
    feedback: FeedbackSubmitRequest,
    current_user: dict = Depends(check_password_reset),
):
    require_roles(current_user, {UserRole.INTERVIEWER}, "Only interviewers can submit feedback")
    await interview_service.submit_feedback(interview_id, feedback.model_dump(), current_user["email"])
    return MessageResponse(message="Feedback submitted successfully")
