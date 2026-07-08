import logging
from bson.objectid import ObjectId
from ..core.database import get_gridfs_bucket
from ..exceptions import (
    BadRequestException,
    ForbiddenException,
    InternalServerException,
    NotFoundException,
)
from ..repositories import (
    candidate_repo,
    interview_repo,
    job_repo,
)
from ..utils.pagination import build_paginated_response
from ..enums import CandidateStatus, UserRole

logger = logging.getLogger(__name__)

# Terminal statuses — no transition allowed once a candidate reaches these
TERMINAL_STATUSES = {CandidateStatus.SELECTED, CandidateStatus.REJECTED}


def _status_rank(status: str) -> int:
    """
    Rank based on the enum's own declaration order.
    PROFILE_CREATED=0, INTERVIEW_SCHEDULED=1, INTERVIEW_COMPLETED=2,
    SELECTED=3, REJECTED=3 (both terminal, same rank).
    """
    order = list(CandidateStatus)
    try:
        target = CandidateStatus(status)
    except ValueError:
        raise BadRequestException(f"Invalid status: {status}")

    if target in TERMINAL_STATUSES:
        return len(order) - 1  # SELECTED and REJECTED share the highest rank

    return order.index(target)


def validate_status_transition(current_status: str, new_status: str):
    try:
        current = CandidateStatus(current_status)
    except ValueError:
        # Unknown/legacy value already stored — don't block forward progress
        return

    target = CandidateStatus(new_status)  # validated for real errors below

    if current == target:
        raise BadRequestException(f"Candidate is already in status '{current.value}'")

    if current in TERMINAL_STATUSES:
        raise BadRequestException(f"Cannot change status once candidate is '{current.value}'")

    if target == CandidateStatus.INTERVIEW_SCHEDULED:
        raise BadRequestException(
            "Interview scheduled status can only be set by scheduling an interview"
        )

    if current == CandidateStatus.PROFILE_CREATED:
        raise BadRequestException(
            "Candidate status can only move from PROFILE_CREATED when an interview is scheduled"
        )

    if current == CandidateStatus.INTERVIEW_SCHEDULED:
        raise BadRequestException(
            "Cannot change candidate status until the scheduled interview is completed"
        )

    if _status_rank(target) < _status_rank(current):
        raise BadRequestException(f"Cannot revert status from '{current.value}' to '{target.value}'")


async def create_candidate(candidate_data: dict, current_user_email: str):
    """
    Create a new candidate record.
    
    Args:
        candidate_data (dict): Candidate profile data including email, mobile, and applied_job_id.
        current_user_email (str): Email of user creating the candidate.
    
    Returns:
        str: Created candidate ID.
    
    Raises:
        NotFoundException: If applied job not found.
        BadRequestException: If email or mobile already registered.
    """

    job = await job_repo.get_job_by_id(candidate_data["applied_job_id"])

    if not job:
        raise NotFoundException("Applied job not found")

    existing = await candidate_repo.get_candidate_by_email_or_mobile(
        candidate_data["email"],
        candidate_data["mobile"],
    )

    if existing:
        raise BadRequestException("Email or Mobile already registered")

    candidate_data["status"] = CandidateStatus.PROFILE_CREATED.value

    candidate_id = await candidate_repo.create_candidate(candidate_data)

    await candidate_repo.add_status_history(
        candidate_id,
        CandidateStatus.PROFILE_CREATED.value,
        current_user_email,
    )

    logger.info("Candidate %s created by %s", candidate_id, current_user_email)

    return candidate_id


async def upload_resume(filename: str, resume_bytes: bytes) -> str:
    fs = get_gridfs_bucket()
    grid_in = fs.open_upload_stream(
        filename=filename,
        metadata={"contentType": "application/pdf"},
    )
    await grid_in.write(resume_bytes)
    await grid_in.close()
    return str(grid_in._id)


async def download_resume_for_user(candidate_id: str, role: str, email: str) -> tuple[bytes, str]:
    candidate = await get_resume_candidate_for_user(candidate_id, role, email)

    try:
        fs = get_gridfs_bucket()
        grid_file = await fs.open_download_stream(ObjectId(candidate["resume_id"]))
        return await grid_file.read(), candidate["resume_filename"]
    except Exception:
        logger.exception("Error downloading resume for %s", candidate_id)
        raise InternalServerException("Error downloading resume")


async def get_candidates(
    page: int = 1,
    limit: int = 10,
    name: str = "",
    email: str = "",
    status: str = "",
    applied_job_id: str = "",
):
    """
    Fetch paginated list of candidates with optional filters.
    
    Args:
        page (int): Page number (default: 1).
        limit (int): Results per page (default: 10).
        name (str): Filter by candidate name.
        email (str): Filter by candidate email.
        status (str): Filter by candidate status.
        applied_job_id (str): Filter by job ID.
    
    Returns:
        dict: Paginated response with candidates and total count.
    """

    candidates, total = await candidate_repo.get_all_candidates(
        page, limit, name, email, status, applied_job_id,
    )

    await attach_job_titles(candidates)

    return build_paginated_response(candidates, page, limit, total)

async def get_candidates_by_ids(candidate_ids: list, page: int = 1, limit: int = 10):
    """
    Fetch paginated candidates by list of IDs.
    
    Args:
        candidate_ids (list): List of candidate IDs.
        page (int): Page number (default: 1).
        limit (int): Results per page (default: 10).
    
    Returns:
        dict: Paginated response with candidates and total count.
    """

    if not candidate_ids:
        return build_paginated_response([], page, limit, 0)

    candidates, total = await candidate_repo.get_candidates_by_ids(candidate_ids, page, limit)

    await attach_job_titles(candidates)

    return build_paginated_response(candidates, page, limit, total)


async def get_candidates_for_user(
    role: str,
    email_user: str,
    page: int = 1,
    limit: int = 10,
    name: str = "",
    email: str = "",
    status: str = "",
    applied_job_id: str = "",
):
    """
    Get candidates based on user role (admin or interviewer).
    
    Args:
        role (str): User role ('Interviewer' or admin).
        email_user (str): User email.
        page (int): Page number (default: 1).
        limit (int): Results per page (default: 10).
        name (str): Filter by candidate name.
        email (str): Filter by candidate email.
        status (str): Filter by candidate status.
        applied_job_id (str): Filter by job ID.
    
    Returns:
        dict: Paginated response with candidates based on role.
    """

    if role == UserRole.INTERVIEWER:
        candidate_ids = (await interview_repo.get_candidate_ids_by_interviewer_email(email_user))
        return await get_candidates_by_ids(candidate_ids, page, limit)

    return await get_candidates(page, limit, name, email, status, applied_job_id)

async def get_candidate_by_id(candidate_id: str):
    """
    Fetch single candidate by ID.
    
    Args:
        candidate_id (str): Candidate ID.
    
    Returns:
        dict: Candidate record or None if not found.
    """

    candidate = await candidate_repo.get_candidate_by_id(candidate_id)

    if not candidate:
        return None

    await attach_job_title(candidate)

    return candidate


async def get_candidate_for_user(candidate_id: str, role: str, email: str):
    """
    Get candidate after verifying user access.
    
    Args:
        candidate_id (str): Candidate ID.
        role (str): User role.
        email (str): User email.
    
    Returns:
        dict: Candidate record.
    
    Raises:
        ForbiddenException: If user not authorized.
        NotFoundException: If candidate not found.
    """

    await ensure_candidate_access(
        candidate_id,
        role,
        email,
        "You are not authorized to view this candidate",
    )

    candidate = await get_candidate_by_id(candidate_id)

    if not candidate:
        raise NotFoundException("Candidate not found")

    return candidate


async def get_resume_candidate_for_user(candidate_id: str, role: str, email: str):
    """
    Get candidate's resume after verifying user access.
    
    Args:
        candidate_id (str): Candidate ID.
        role (str): User role.
        email (str): User email.
    
    Returns:
        dict: Candidate record with resume.
    
    Raises:
        ForbiddenException: If user not authorized.
        NotFoundException: If candidate or resume not found.
    """

    await ensure_candidate_access(
        candidate_id,
        role,
        email,
        "You are not authorized to view this resume",
    )

    candidate = await get_candidate_by_id(candidate_id)

    if not candidate:
        raise NotFoundException("Candidate not found")

    if not candidate.get("resume_id"):
        raise NotFoundException("Resume not found for this candidate")

    return candidate


async def update_candidate(candidate_id: str, candidate_data: dict, current_user_email: str):
    """
    Update candidate profile data.
    
    Args:
        candidate_id (str): Candidate ID.
        candidate_data (dict): Updated candidate data.
        current_user_email (str): Email of user updating candidate.
    
    Raises:
        BadRequestException: If email/mobile already registered or update fails.
    """

    validate_candidate_id(candidate_id)

    existing = await candidate_repo.get_candidate_by_email_or_mobile_exclude(
        candidate_data["email"],
        candidate_data["mobile"],
        candidate_id,
    )

    if existing:
        raise BadRequestException("Email or Mobile already registered to another candidate")

    updated = await candidate_repo.update_candidate(candidate_id, candidate_data)

    if updated == 0:
        raise BadRequestException("Candidate could not be updated")

    logger.info("Candidate %s updated by %s", candidate_id, current_user_email)


async def update_status(candidate_id: str, status: str, current_user_email: str):
    """
    Update candidate status with validation and history tracking.
    
    Args:
        candidate_id (str): Candidate ID.
        status (str): New candidate status.
        current_user_email (str): Email of user updating status.
    
    Raises:
        NotFoundException: If candidate not found.
        BadRequestException: If status transition invalid or update fails.
    """

    validate_candidate_id(candidate_id)

    candidate = await candidate_repo.get_candidate_by_id(candidate_id)

    if not candidate:
        raise NotFoundException("Candidate not found")

    validate_status_transition(candidate.get("status"), status)

    updated = await candidate_repo.update_candidate_status(candidate_id, status)

    if updated == 0:
        raise BadRequestException("Status could not be updated")

    await candidate_repo.add_status_history(candidate_id, status, current_user_email)

    logger.info("Candidate %s status changed to %s by %s", candidate_id, status, current_user_email)


async def get_history(candidate_id: str, page: int = 1, limit: int = 10):
    """
    Fetch paginated status change history for a candidate.
    
    Args:
        candidate_id (str): Candidate ID.
        page (int): Page number (default: 1).
        limit (int): Results per page (default: 10).
    
    Returns:
        dict: Paginated response with status history.
    """

    history, total = await candidate_repo.get_status_history(candidate_id, page, limit)

    for item in history:
        item["id"] = str(item.pop("_id"))

    return build_paginated_response(history, page, limit, total)


async def get_history_for_user(
    candidate_id: str,
    role: str,
    email: str,
    page: int = 1,
    limit: int = 10,
):
    """
    Get candidate history after verifying user access.
    
    Args:
        candidate_id (str): Candidate ID.
        role (str): User role.
        email (str): User email.
        page (int): Page number (default: 1).
        limit (int): Results per page (default: 10).
    
    Returns:
        dict: Paginated response with status history.
    
    Raises:
        ForbiddenException: If user not authorized.
    """

    await ensure_candidate_access(
        candidate_id,
        role,
        email,
        "You are not authorized to view this candidate's history",
    )

    return await get_history(candidate_id, page, limit)


def validate_candidate_id(candidate_id: str):
    if not ObjectId.is_valid(candidate_id):
        raise BadRequestException("Invalid candidate ID format")


async def ensure_candidate_access(
    candidate_id: str,
    role: str,
    email: str,
    forbidden_message: str,
):
    """
    Verify interviewer has access to candidate.
    
    Args:
        candidate_id (str): Candidate ID.
        role (str): User role.
        email (str): User email.
        forbidden_message (str): Error message if access denied.
    
    Raises:
        BadRequestException: If candidate ID invalid.
        ForbiddenException: If access denied.
    """

    validate_candidate_id(candidate_id)

    if role != UserRole.INTERVIEWER:
        return

    has_access = await interview_repo.interviewer_has_candidate(email,candidate_id)

    if not has_access:
        raise ForbiddenException(forbidden_message)


async def attach_job_title(candidate: dict):
    """
    Attach job title to candidate record.
    
    Args:
        candidate (dict): Candidate record to update.
    """

    candidate["id"] = str(candidate.pop("_id"))

    job = await job_repo.get_job_by_id(candidate["applied_job_id"])

    candidate["job_title"] = job["title"] if job else "Unknown"


async def attach_job_titles(candidates: list):
    """
    Attach job titles to list of candidates.
    
    Args:
        candidates (list): List of candidate records to update.
    """

    for candidate in candidates:
        await attach_job_title(candidate)
