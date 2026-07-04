import logging

from bson.objectid import ObjectId

from ..exceptions import (
    BadRequestException,
    ForbiddenException,
    NotFoundException,
)
from ..repositories import (
    candidate_repo,
    interview_repo,
    job_repo,
)
from ..utils.pagination import build_paginated_response

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


async def get_candidates(
    page: int = 1,
    limit: int = 10,
    name: str = "",
):
    """
    Return paginated candidates.
    """

    candidates, total = await candidate_repo.get_all_candidates(
        page,
        limit,
        name,
    )

    await attach_job_titles(candidates)

    return build_paginated_response(candidates, page, limit, total)


async def get_candidates_by_ids(
    candidate_ids: list,
    page: int = 1,
    limit: int = 10,
):
    """
    Return candidates assigned to interviewer.
    """

    if not candidate_ids:
        return build_paginated_response([], page, limit, 0)

    candidates, total = await candidate_repo.get_candidates_by_ids(
        candidate_ids,
        page,
        limit,
    )

    await attach_job_titles(candidates)

    return build_paginated_response(candidates, page, limit, total)


async def get_candidates_for_user(
    role: str,
    email: str,
    page: int = 1,
    limit: int = 10,
    name: str = "",
):
    if role == "Interviewer":
        candidate_ids = (
            await interview_repo.get_candidate_ids_by_interviewer_email(
                email
            )
        )

        return await get_candidates_by_ids(candidate_ids, page, limit)

    return await get_candidates(page, limit, name)


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
    await ensure_candidate_access(
        candidate_id,
        role,
        email,
        "You are not authorized to view this candidate",
    )

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
    await ensure_candidate_access(
        candidate_id,
        role,
        email,
        "You are not authorized to view this resume",
    )

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


async def get_history(
    candidate_id: str,
    page: int = 1,
    limit: int = 10,
):
    history, total = await candidate_repo.get_status_history(
        candidate_id,
        page,
        limit,
    )

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
    await ensure_candidate_access(
        candidate_id,
        role,
        email,
        "You are not authorized to view this candidate's history",
    )

    return await get_history(candidate_id, page, limit)


def validate_candidate_id(candidate_id: str):
    if not ObjectId.is_valid(candidate_id):
        raise BadRequestException(
            "Invalid candidate ID format"
        )


async def ensure_candidate_access(
    candidate_id: str,
    role: str,
    email: str,
    forbidden_message: str,
):
    validate_candidate_id(candidate_id)

    if role != "Interviewer":
        return

    has_access = (
        await interview_repo.interviewer_has_candidate(
            email,
            candidate_id,
        )
    )

    if not has_access:
        raise ForbiddenException(
            forbidden_message
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
