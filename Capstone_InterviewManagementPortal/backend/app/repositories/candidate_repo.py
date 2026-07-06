"""
Repository layer for candidate database operations.
"""

import datetime

from bson.objectid import ObjectId

from ..core.database import db
from ..utils.pagination import paginate_collection


async def create_candidate(candidate_data: dict) -> str:
    """
    Create a new candidate.
    """
    result = await db.candidates.insert_one(candidate_data)
    return str(result.inserted_id)


async def get_all_candidates(
    page: int = 1,
    limit: int = 10,
    name: str = "",
    email: str = "",
    status: str = "",
    applied_job_id: str = "",
):
    """
    Return paginated candidates, optionally filtered.
    """
    query = {}
    conditions = []

    if name:
        conditions.append({
            "$or": [
                {"first_name": {"$regex": name.strip(), "$options": "i"}},
                {"last_name": {"$regex": name.strip(), "$options": "i"}},
            ]
        })

    if email:
        conditions.append({
            "email": {"$regex": email.strip(), "$options": "i"}
        })

    if status:
        conditions.append({"status": status})

    if applied_job_id:
        conditions.append({"applied_job_id": applied_job_id})

    if conditions:
        query["$and"] = conditions

    return await paginate_collection(db.candidates, query, page, limit, sort=("_id", -1))

async def get_candidate_by_id(candidate_id: str):
    """
    Retrieve candidate by id.
    """
    if not ObjectId.is_valid(candidate_id):
        return None

    return await db.candidates.find_one(
        {"_id": ObjectId(candidate_id)}
    )


async def get_candidate_by_email_or_mobile(
    email: str,
    mobile: str,
):
    """
    Find candidate using email or mobile.
    """
    return await db.candidates.find_one(
        {
            "$or": [
                {"email": email.strip().lower()},
                {"mobile": mobile},
            ]
        }
    )


async def get_candidate_by_email_or_mobile_exclude(
    email: str,
    mobile: str,
    exclude_id: str,
):
    """
    Find candidate using email/mobile excluding current record.
    """
    return await db.candidates.find_one(
        {
            "_id": {"$ne": ObjectId(exclude_id)},
            "$or": [
                {"email": email.strip().lower()},
                {"mobile": mobile},
            ],
        }
    )


async def update_candidate(
    candidate_id: str,
    candidate_data: dict,
) -> int:
    """
    Update candidate information.

    Returns modified document count.
    """
    result = await db.candidates.update_one(
        {"_id": ObjectId(candidate_id)},
        {"$set": candidate_data},
    )

    return result.modified_count


async def update_candidate_status(
    candidate_id: str,
    status: str,
) -> int:
    """
    Update candidate status.

    Returns modified document count.
    """
    result = await db.candidates.update_one(
        {"_id": ObjectId(candidate_id)},
        {"$set": {"status": status}},
    )

    return result.modified_count


async def add_status_history(
    candidate_id: str,
    status: str,
    updated_by: str,
):
    """
    Store candidate status history.
    """
    await db.status_history.insert_one(
        {
            "candidate_id": candidate_id,
            "status": status,
            "updated_by": updated_by,
            "timestamp": datetime.datetime.now(
                datetime.timezone.utc
            ).isoformat(),
        }
    )


async def get_status_history(
    candidate_id: str,
    page: int = 1,
    limit: int = 10,
):
    """
    Return candidate status history.
    """
    return await paginate_collection(
        db.status_history,
        {"candidate_id": candidate_id},
        page,
        limit,
        sort=("timestamp", -1),
    )


async def get_candidates_by_ids(
    candidate_ids: list,
    page: int = 1,
    limit: int = 10,
):
    """
    Return candidates matching provided ids.
    """
    object_ids = [ObjectId(cid) for cid in candidate_ids]

    return await paginate_collection(
        db.candidates,
        {"_id": {"$in": object_ids}},
        page,
        limit,
        sort=("_id", -1)
    )
