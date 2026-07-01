from pydantic import BaseModel, field_validator
from datetime import date, datetime
import re

from ...constants.app_constants import REQUIRED_EMAIL_DOMAIN

class InterviewCreateRequest(BaseModel):
    candidate_id: str
    job_id: str
    job_title: str
    interview_date: str
    interview_time: str
    interviewer_email: str
    focus_areas: str

    @field_validator("interview_date")
    @classmethod
    def date_must_be_future(cls, v: str) -> str:
        try:
            interview_date = date.fromisoformat(v)
        except ValueError:
            raise ValueError("Interview date must be in YYYY-MM-DD format")
        if interview_date < date.today():
            raise ValueError("Interview date must be today or in the future")
        return v

    @field_validator("interview_time")
    @classmethod
    def time_must_be_valid(cls, v: str) -> str:
        if not re.match(r"^([01]\d|2[0-3]):[0-5]\d$", v):
            raise ValueError("Interview time must be in HH:MM format (e.g. 14:00)")
        return v

    @field_validator("focus_areas", "job_title")
    @classmethod
    def must_not_be_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("This field cannot be blank")
        return v

    @field_validator("interviewer_email")
    @classmethod
    def email_lowercase(cls, v: str) -> str:
        return v.strip().lower()

    @field_validator("interviewer_email")
    @classmethod
    def email_must_be_nucleusteq(cls, v: str) -> str:
        v = v.strip().lower()
        if not v.endswith(f"@{REQUIRED_EMAIL_DOMAIN}"):
            raise ValueError(f"Email must use the {REQUIRED_EMAIL_DOMAIN} domain")
        return v
    
    @field_validator('interviewer_email')
    @classmethod
    def reject_strange_characters(cls, v: str) -> str:
        # Enforce that the local part only contains normal letters, numbers, dots, or single hyphens/underscores
        local_part = v.split('@')[0]
        if not re.match(r"^[a-zA-Z0-9.]+$", local_part):
            raise ValueError("Email contains unaccepted special characters")
        return v
