import logging

from bson.objectid import ObjectId

from ..exceptions import (
    BadRequestException,
    NotFoundException,
)
from ..repositories import (
    candidate_repo,
    job_repo,
)

logger = logging.getLogger(__name__)


async def create_candidate(candidate_data: dict, current_user_email: str):
    """
    Create a new candidate.
    """

    job = await job_repo.get_job_by_id(candidate_data["applied_job_id"])
    if not job:
        raise NotFoundException("Applied job not found")

    existing = await candidate_repo.get_candidate_by_email_or_mobile(
        candidate_data["email"],
        candidate_data["mobile"],
    )

    if existing:
        raise BadRequestException(
            "Email or Mobile already registered"
        )

    candidate_data["status"] = "PROFILE_CREATED"

    candidate_id = await candidate_repo.create_candidate(candidate_data)

    await candidate_repo.add_status_history(
        candidate_id,
        "PROFILE_CREATED",
        current_user_email,
    )

    logger.info(
        "Candidate %s created by %s",
        candidate_id,
        current_user_email,
    )

    return candidate_id


async def get_candidates(page: int = 1):
    """
    Return paginated candidates.
    """

    candidates = await candidate_repo.get_all_candidates(page)

    await attach_job_titles(candidates)

    return candidates


async def get_candidates_by_ids(candidate_ids: list):
    """
    Return candidates assigned to interviewer.
    """

    if not candidate_ids:
        return []

    candidates = await candidate_repo.get_candidates_by_ids(candidate_ids)

    await attach_job_titles(candidates)

    return candidates


async def get_candidates_for_user(
    role: str,
    email: str,
    page: int = 1,
):
    if page < 1:
        raise BadRequestException(
            "Page number must be 1 or greater"
        )

    return await get_candidates(page)


async def get_candidate_by_id(candidate_id: str):
    """
    Return candidate by id.
    """

    candidate = await candidate_repo.get_candidate_by_id(candidate_id)

    if not candidate:
        return None

    await attach_job_title(candidate)

    return candidate


async def get_candidate_for_user(
    candidate_id: str,
    role: str,
    email: str,
):
    candidate = await get_candidate_by_id(candidate_id)

    if not candidate:
        raise NotFoundException(
            "Candidate not found"
        )

    return candidate


async def get_resume_candidate_for_user(
    candidate_id: str,
    role: str,
    email: str,
):

    candidate = await get_candidate_by_id(candidate_id)

    if not candidate:
        raise NotFoundException(
            "Candidate not found"
        )

    if not candidate.get("resume_id"):
        raise NotFoundException(
            "Resume not found for this candidate"
        )

    return candidate


async def update_candidate(
    candidate_id: str,
    candidate_data: dict,
    current_user_email: str,
):
    existing = (
        await candidate_repo.get_candidate_by_email_or_mobile_exclude(
            candidate_data["email"],
            candidate_data["mobile"],
            candidate_id,
        )
    )

    if existing:
        raise BadRequestException(
            "Email or Mobile already registered to another candidate"
        )

    updated = await candidate_repo.update_candidate(
        candidate_id,
        candidate_data,
    )

    if updated == 0:
        raise BadRequestException(
            "Candidate could not be updated"
        )

    logger.info(
        "Candidate %s updated by %s",
        candidate_id,
        current_user_email,
    )


async def update_status(
    candidate_id: str,
    status: str,
    current_user_email: str,
):
    updated = await candidate_repo.update_candidate_status(
        candidate_id,
        status,
    )

    if updated == 0:
        raise BadRequestException(
            "Status could not be updated"
        )

    await candidate_repo.add_status_history(
        candidate_id,
        status,
        current_user_email,
    )

    logger.info(
        "Candidate %s status changed to %s by %s",
        candidate_id,
        status,
        current_user_email,
    )


async def get_history(candidate_id: str):
    history = await candidate_repo.get_status_history(candidate_id)

    for item in history:
        item["id"] = str(item.pop("_id"))

    return history


async def get_history_for_user(
    candidate_id: str,
    role: str,
    email: str,
):

    return await get_history(candidate_id)


def validate_candidate_id(candidate_id: str):
    if not ObjectId.is_valid(candidate_id):
        raise BadRequestException(
            "Invalid candidate ID format"
        )



async def attach_job_title(candidate: dict):
    """
    Attach job title to a single candidate.
    """

    candidate["id"] = str(candidate.pop("_id"))

    job = await job_repo.get_job_by_id(
        candidate["applied_job_id"]
    )

    candidate["job_title"] = (
        job["title"] if job else "Unknown"
    )


async def attach_job_titles(candidates: list):
    """
    Attach job titles to a list of candidates.
    """

    for candidate in candidates:
        await attach_job_title(candidate)