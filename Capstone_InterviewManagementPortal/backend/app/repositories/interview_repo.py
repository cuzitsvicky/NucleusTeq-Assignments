import logging
from ..core.database import db
from bson.objectid import ObjectId
from ..enums import InterviewStatus
from ..utils.pagination import paginate_collection
from datetime import datetime

logger = logging.getLogger(__name__)


# To create a new interview in the database
async def create_interview(interview_data: dict):
    logger.info("Inserting new interview into database for candidate ID: %s", interview_data.get("candidate_id"))
    result = await db.interviews.insert_one(interview_data)
    logger.info("Interview inserted in database with ID: %s", result.inserted_id)
    return str(result.inserted_id)


# To get all interviews with optional filters and pagination
async def get_all_interviews(query: dict | None = None, page: int = 1, limit: int = 10):
    logger.info("Retrieving interviews with query: %s, page: %d, limit: %d", query, page, limit)
    return await paginate_collection(
        db.interviews, query or {}, page, limit, sort=("_id", -1)
    )


# To get an interview by ID
async def get_interview_by_id(interview_id: str):
    if not ObjectId.is_valid(interview_id):
        logger.warning("Invalid interview ID format requested: %s", interview_id)
        return None
    logger.info("Fetching interview by ID from database: %s", interview_id)
    return await db.interviews.find_one({"_id": ObjectId(interview_id)})


# Function to get an interview by candidate ID, interviewer email, and interview date
async def get_interview_by_candidate_and_date(
    candidate_id: str, interviewer_email: str, interview_date: str
):
    logger.info("Fetching interview for candidate: %s with interviewer: %s on date: %s", candidate_id, interviewer_email, interview_date)
    return await db.interviews.find_one(
        {
            "candidate_id": candidate_id,
            "interviewer_email": interviewer_email,
            "interview_date": interview_date,
            "status": InterviewStatus.SCHEDULED.value,
        }
    )


# Function to get candidate IDs associated with a specific interviewer
async def get_candidate_ids_by_interviewer_email(interviewer_email: str):
    logger.info("Fetching candidate IDs for interviewer: %s", interviewer_email)
    interviews = await db.interviews.find(
        {"interviewer_email": interviewer_email}
    ).to_list(length=None)
    return list({interview["candidate_id"] for interview in interviews})


# Function to check if an interviewer has a specific candidate assigned for an interview
async def interviewer_has_candidate(interviewer_email: str, candidate_id: str):
    logger.info("Checking if interviewer %s has candidate %s assigned", interviewer_email, candidate_id)
    interview = await db.interviews.find_one(
        {"interviewer_email": interviewer_email, "candidate_id": candidate_id}
    )
    return interview is not None


# Function to check if an interviewer has a future scheduled interview that is not completed
async def interviewer_has_pending_future_interview(interviewer_email: str):
    logger.info("Checking pending future interviews for interviewer: %s", interviewer_email)
    now = datetime.now()
    today = now.strftime("%Y-%m-%d")
    current_time = now.strftime("%H:%M")

    interview = await db.interviews.find_one(
        {
            "interviewer_email": interviewer_email,
            "status": InterviewStatus.SCHEDULED.value,
            "$or": [
                {"interview_date": {"$gt": today}},
                {
                    "interview_date": today,
                    "interview_time": {"$gt": current_time},
                },
            ],
        }
    )
    return interview is not None


## To update the status of an interview
async def update_interview_status(interview_id: str, status: str):
    logger.info("Updating status of interview %s to %s in database", interview_id, status)
    await db.interviews.update_one(
        {"_id": ObjectId(interview_id)}, {"$set": {"status": status}}
    )


async def update_interview_schedule(interview_id: str, interview_data: dict):
    logger.info("Updating schedule of interview %s in database", interview_id)
    result = await db.interviews.update_one(
        {"_id": ObjectId(interview_id)},
        {"$set": interview_data},
    )
    return getattr(result, "matched_count", result.modified_count)


# Function to check if an interviewer is already booked at a specific date and time
async def has_interviewer_conflict(
    interviewer_email: str,
    interview_date: str,
    interview_time: str,
    exclude_interview_id: str | None = None,
):
    logger.info("Checking interviewer conflict for %s on %s %s", interviewer_email, interview_date, interview_time)
    query = {
        "interviewer_email": interviewer_email,
        "interview_date": interview_date,
        "interview_time": interview_time,
        "status": InterviewStatus.SCHEDULED.value,
    }
    if exclude_interview_id and ObjectId.is_valid(exclude_interview_id):
        query["_id"] = {"$ne": ObjectId(exclude_interview_id)}

    interview = await db.interviews.find_one(query)
    return interview is not None


# Function to create feedback for an interview
async def create_feedback(feedback_data: dict):
    logger.info("Inserting feedback into database for interview ID: %s", feedback_data.get("interview_id"))
    await db.feedback.insert_one(feedback_data)


## To get feedback for a specific interview
async def get_feedback_for_interview(interview_id: str):
    logger.info("Fetching feedback from database for interview ID: %s", interview_id)
    return await db.feedback.find_one({"interview_id": str(interview_id)})
