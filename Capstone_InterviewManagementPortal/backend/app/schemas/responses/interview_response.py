from pydantic import BaseModel
from .feedback_response import FeedbackResponse

class InterviewResponse(BaseModel):
    id: str
    candidate_id: str
    job_id: str
    interview_date: str
    interview_time: str
    interviewer_email: str
    focus_areas: str
    status: str
    candidate_name: str
    job_title: str
    feedback: FeedbackResponse | None = None
