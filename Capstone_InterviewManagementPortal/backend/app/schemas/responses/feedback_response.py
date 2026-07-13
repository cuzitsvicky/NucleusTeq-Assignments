from pydantic import BaseModel

class FeedbackResponse(BaseModel):
    id: str
    interview_id: str
    interviewer_email: str
    technical_rating: int
    communication_rating: int
    problem_solving_rating: int
    tech_areas_covered: str
    comments: str
    recommendation: str
