import logging
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
from ..services.auth_service import check_password_reset


router = APIRouter()
logger = logging.getLogger(__name__)

# Endpoint to schedule a new interview
@router.post(
    "/schedule",
    response_model=MessageWithIdResponse,
    status_code=status.HTTP_201_CREATED,
)
async def schedule_interview(interview: InterviewCreateRequest, current_user: dict = Depends(check_password_reset)):
    require_roles(current_user, {UserRole.HR})
    logger.info("API request to schedule interview for candidate ID: %s by HR user: %s", interview.candidate_id, current_user["email"])
    interview_id = await interview_service.schedule_interview(interview.model_dump(), current_user["email"])
    logger.info("Interview scheduled successfully with ID: %s", interview_id)
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
    logger.info("API request to update interview schedule for ID: %s by HR user: %s", interview_id, current_user["email"])
    await interview_service.update_interview_schedule(interview_id, interview.model_dump())
    logger.info("Interview ID: %s schedule updated successfully", interview_id)
    return MessageResponse(message="Interview updated")


# Endpoint to get a list of interviews with optional filters and pagination
@router.get("/", response_model=PaginatedResponse[InterviewResponse])
async def get_interviews(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(check_password_reset),
):
    logger.info("API request to fetch interviews by user: %s (role: %s), page: %d, limit: %d", current_user["email"], current_user["role"], page, limit)
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
    logger.info("API request to submit feedback for interview ID: %s by interviewer: %s", interview_id, current_user["email"])
    await interview_service.submit_feedback(interview_id, feedback.model_dump(), current_user["email"])
    logger.info("Feedback submitted successfully for interview ID: %s", interview_id)
    return MessageResponse(message="Feedback submitted successfully")
