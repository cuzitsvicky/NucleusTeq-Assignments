from ..repositories import interview_repo, candidate_repo, job_repo, user_repo
from ..exceptions import (
    ForbiddenException,
    BadRequestException,
    NotFoundException,
    ConflictException,
)
from ..enums.candidate_status import CandidateStatus
from ..utils.pagination import build_paginated_response
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

SCHEDULEABLE_STATUSES = [
    CandidateStatus.PROFILE_CREATED.value,
    CandidateStatus.INTERVIEW_COMPLETED.value,
]


def ensure_interview_time_has_started(interview: dict):

    try:
        scheduled_at = datetime.strptime(
            f"{interview['interview_date']} {interview['interview_time']}",
            "%Y-%m-%d %H:%M",
        )
    except (KeyError, TypeError, ValueError):
        raise BadRequestException("Interview schedule is invalid")

    if datetime.now() < scheduled_at:
        raise BadRequestException("Feedback can only be submitted after the scheduled interview time")


async def schedule_interview(interview_data: dict, current_user_email: str):
    """
    Schedule an interview for a candidate with an interviewer.
    
    Args:
        interview_data (dict): Interview details including candidate_id, interviewer_email, job_id.
        current_user_email (str): Email of user scheduling interview.
    
    Returns:
        str: Created interview ID.
    
    Raises:
        NotFoundException: If candidate, interviewer, or job not found.
        BadRequestException: If candidate status not scheduleable or duplicate interview exists.
        ConflictException: If interview already scheduled.
    """

    # Validate candidate exists and is in scheduleable status
    candidate = await candidate_repo.get_candidate_by_id(interview_data["candidate_id"])

    if not candidate:
        raise NotFoundException("Candidate not found")
    
    if candidate.get("status") not in SCHEDULEABLE_STATUSES:
        raise BadRequestException(
            f"Candidate must be in PROFILE_CREATED or INTERVIEW_COMPLETED status to schedule an interview"
        )

    # Validate interviewer exists and has Interviewer role
    interviewer = await user_repo.get_user_by_email(interview_data["interviewer_email"])

    if not interviewer:
        raise NotFoundException("Interviewer user not found")
    
    if interviewer.get("role") != "Interviewer":
        raise BadRequestException("Assigned user must have the Interviewer role")
    
    if not interviewer.get("active", True):
        raise BadRequestException("Assigned interviewer account is disabled")

    # Validate job exists
    job = await job_repo.get_job_by_id(interview_data["job_id"])
    if not job:
        raise NotFoundException("Job not found")

    # Check for duplicate interview
    existing = await interview_repo.get_interview_by_candidate_and_date(
        interview_data["candidate_id"],
        interview_data["interviewer_email"],
        interview_data["interview_date"],
    )

    if existing:
        raise ConflictException(
            "An interview is already scheduled for this candidate with this interviewer on this date"
        )

    interview_data["status"] = "SCHEDULED"

    interview_id = await interview_repo.create_interview(interview_data)

    await candidate_repo.update_candidate_status(interview_data["candidate_id"], "INTERVIEW_SCHEDULED")

    await candidate_repo.add_status_history(interview_data["candidate_id"], "INTERVIEW_SCHEDULED", current_user_email)

    return interview_id


async def get_interviews(role: str, email: str, page: int = 1, limit: int = 10):
    """
    Fetch paginated interviews (filtered by role and email).
    
    Args:
        role (str): User role ('Interviewer' or admin).
        email (str): User email.
        page (int): Page number (default: 1).
        limit (int): Results per page (default: 10).
    
    Returns:
        dict: Paginated response with interviews including candidate names and feedback.
    """

    query = {"interviewer_email": email} if role == "Interviewer" else {}

    interviews, total = await interview_repo.get_all_interviews(query, page=page, limit=limit)

    for i in interviews:
        i["id"] = str(i.pop("_id"))
        candidate = await candidate_repo.get_candidate_by_id(i["candidate_id"])
        i["candidate_name"] = (
            f"{candidate['first_name']} {candidate['last_name']}"
            if candidate
            else "Unknown"
        )
        j = await job_repo.get_job_by_id(i["job_id"])
        i["job_title"] = j["title"] if j else "Unknown"
        fb = await interview_repo.get_feedback_for_interview(i["id"])
        if fb:
            fb["id"] = str(fb.pop("_id"))
        i["feedback"] = fb
    return build_paginated_response(interviews, page, limit, total)


async def submit_feedback(interview_id: str, feedback_data: dict, current_user_email: str):
    """
    Submit feedback for a completed interview and update candidate status.
    
    Args:
        interview_id (str): Interview ID.
        feedback_data (dict): Feedback details including rating, comments, recommendation.
        current_user_email (str): Email of interviewer submitting feedback.
    
    Raises:
        NotFoundException: If interview not found.
        ForbiddenException: If user not the assigned interviewer.
        ConflictException: If feedback already submitted.
        BadRequestException: If interview time not yet started.
    """

    interview = await interview_repo.get_interview_by_id(interview_id)

    if not interview:
        raise NotFoundException("Interview not found")
    
    if interview["interviewer_email"] != current_user_email:
        raise ForbiddenException("Not authorized for this interview")
    
    if interview.get("status") == "COMPLETED":
        raise ConflictException("Feedback has already been submitted for this interview")

    ensure_interview_time_has_started(interview)

    existing_feedback = await interview_repo.get_feedback_for_interview(interview_id)

    if existing_feedback:
        raise ConflictException("Feedback has already been submitted for this interview")

    feedback_data["interview_id"] = str(interview_id)

    feedback_data["interviewer_email"] = current_user_email

    await interview_repo.create_feedback(feedback_data)

    await interview_repo.update_interview_status(interview_id, "COMPLETED")

    candidate_id = interview["candidate_id"]

    await candidate_repo.update_candidate_status(candidate_id, "INTERVIEW_COMPLETED")

    await candidate_repo.add_status_history(candidate_id, "INTERVIEW_COMPLETED", current_user_email)
    
    logger.info(
        f"Feedback submitted by {current_user_email} for interview {interview_id}. Candidate {candidate_id} status updated to INTERVIEW_COMPLETED."
    )
