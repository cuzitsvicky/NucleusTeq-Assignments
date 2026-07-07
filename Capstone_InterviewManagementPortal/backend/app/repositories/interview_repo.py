from ..core.database import db
from bson.objectid import ObjectId
from ..utils.pagination import paginate_collection

# To create a new interview in the database
async def create_interview(interview_data: dict):

    result = await db.interviews.insert_one(interview_data)
    return str(result.inserted_id)

# To get all interviews with optional filters and pagination
async def get_all_interviews(query: dict | None = None, page: int = 1, limit: int = 10):
    return await paginate_collection(db.interviews, query or {}, page, limit, sort=("_id", -1))

# To get an interview by ID
async def get_interview_by_id(interview_id: str):
    if not ObjectId.is_valid(interview_id):
        return None
    return await db.interviews.find_one({"_id": ObjectId(interview_id)})

# Function to get an interview by candidate ID, interviewer email, and interview date
async def get_interview_by_candidate_and_date(candidate_id: str, interviewer_email: str, interview_date: str):
    return await db.interviews.find_one(
        {
            "candidate_id": candidate_id,
            "interviewer_email": interviewer_email,
            "interview_date": interview_date,
            "status": "SCHEDULED",
        }
    )

# Function to get candidate IDs associated with a specific interviewer
async def get_candidate_ids_by_interviewer_email(interviewer_email: str):
    interviews = await db.interviews.find(
        {"interviewer_email": interviewer_email}
    ).to_list(length=None)
    return list({interview["candidate_id"] for interview in interviews})

# Function to check if an interviewer has a specific candidate assigned for an interview
async def interviewer_has_candidate(interviewer_email: str, candidate_id: str):
    interview = await db.interviews.find_one(
        {"interviewer_email": interviewer_email, "candidate_id": candidate_id}
    )
    return interview is not None

## To update the status of an interview
async def update_interview_status(interview_id: str, status: str):
    await db.interviews.update_one({"_id": ObjectId(interview_id)}, {"$set": {"status": status}})

# Function to create feedback for an interview
async def create_feedback(feedback_data: dict):
    await db.feedback.insert_one(feedback_data)

## To get feedback for a specific interview
async def get_feedback_for_interview(interview_id: str):
    return await db.feedback.find_one({"interview_id": str(interview_id)})
