from pydantic import BaseModel, field_validator
from ...enums.recommendation import Recommendation

class FeedbackSubmitRequest(BaseModel):
    technical_rating: int
    communication_rating: int
    problem_solving_rating: int
    tech_areas_covered: str
    comments: str
    recommendation: Recommendation

    @field_validator(
        "technical_rating", "communication_rating", "problem_solving_rating"
    )
    @classmethod
    def rating_must_be_valid(cls, v: int) -> int:
        if not isinstance(v, int) or isinstance(v, bool):
            raise ValueError("Rating must be a whole number")
        if not (1 <= v <= 5):
            raise ValueError("Rating must be between 1 and 5")
        return v

    @field_validator("tech_areas_covered", "comments")
    @classmethod
    def must_not_be_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("This field cannot be blank")
        return v
