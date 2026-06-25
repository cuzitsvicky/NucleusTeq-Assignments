from pydantic import BaseModel, field_validator
from typing import Literal
import re

class JobCreateRequest(BaseModel):
    title: str
    job_details: str
    job_role: str
    required_skills: str
    experience_required: str
    employment_type: Literal["Full Time", "Internship"]
    location: str

    @field_validator("title", "job_details", "job_role", "required_skills", "location")
    @classmethod
    def must_not_be_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("This field cannot be blank")
        return v

    @field_validator("title")
    @classmethod
    def title_max_length(cls, v: str) -> str:
        if len(v) > 150:
            raise ValueError("Title must not exceed 150 characters")
        return v

    @field_validator("experience_required")
    @classmethod
    def experience_format(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Experience required cannot be blank")
        pattern = (
            r"^\d+(\.\d+)?(\s*-\s*\d+(\.\d+)?)?\s*(year|years|yr|yrs|month|months)$"
        )
        if not re.match(pattern, v, re.IGNORECASE):
            raise ValueError(
                'Experience must follow format like "2 years", "2-4 years", "6 months"'
            )
        return v
