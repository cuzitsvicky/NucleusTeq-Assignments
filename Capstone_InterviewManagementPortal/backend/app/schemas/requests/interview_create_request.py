from datetime import date, datetime
import re

from pydantic import BaseModel, field_validator, model_validator

from ...constants.app_constants import REQUIRED_EMAIL_DOMAIN
from ...utils import normalize_email


def validate_interview_schedule(interview_date: str, interview_time: str) -> None:
    scheduled_at = datetime.strptime(
        f"{interview_date} {interview_time}",
        "%Y-%m-%d %H:%M",
    )

    if scheduled_at <= datetime.now():
        raise ValueError("Interview date and time must be in the future")


def validate_not_blank(value: str, field_name: str) -> str:
    value = value.strip()

    if not value:
        raise ValueError(f"{field_name} cannot be blank")

    return value


class InterviewCreateRequest(BaseModel):
    candidate_id: str
    job_id: str
    job_title: str
    interview_date: str
    interview_time: str
    interviewer_email: str
    focus_areas: str

    @model_validator(mode="after")
    def schedule_must_be_future(self):
        validate_interview_schedule(
            self.interview_date,
            self.interview_time,
        )
        return self

    @field_validator("interview_date")
    @classmethod
    def date_must_be_future(cls, v: str) -> str:
        v = validate_not_blank(v, "Interview date")

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
        v = validate_not_blank(v, "Interview time")

        if not re.match(r"^([01]\d|2[0-3]):[0-5]\d$", v):
            raise ValueError(
                "Interview time must be in HH:MM format (e.g. 14:00)"
            )

        return v

    @field_validator("job_title")
    @classmethod
    def validate_job_title(cls, v: str) -> str:
        return validate_not_blank(v, "Job Title")

    @field_validator("focus_areas")
    @classmethod
    def validate_focus_areas(cls, v: str) -> str:
        return validate_not_blank(v, "Focus Areas")

    @field_validator("interviewer_email")
    @classmethod
    def validate_interviewer_email(cls, v: str) -> str:
        v = normalize_email(v)

        if not v:
            raise ValueError("Email cannot be blank")

        if not v.endswith(f"@{REQUIRED_EMAIL_DOMAIN}"):
            raise ValueError(
                f"Email must use the {REQUIRED_EMAIL_DOMAIN} domain"
            )

        local_part = v.split("@")[0]

        if not re.match(r"^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*$", local_part):
            raise ValueError("Email contains unaccepted special characters")

        return v


class InterviewUpdateRequest(BaseModel):
    interview_date: str
    interview_time: str
    focus_areas: str

    @model_validator(mode="after")
    def schedule_must_be_future(self):
        validate_interview_schedule(
            self.interview_date,
            self.interview_time,
        )
        return self

    @field_validator("interview_date")
    @classmethod
    def date_must_be_future(cls, v: str) -> str:
        return InterviewCreateRequest.date_must_be_future(v)

    @field_validator("interview_time")
    @classmethod
    def time_must_be_valid(cls, v: str) -> str:
        return InterviewCreateRequest.time_must_be_valid(v)

    @field_validator("focus_areas")
    @classmethod
    def validate_focus_areas(cls, v: str) -> str:
        return InterviewCreateRequest.validate_focus_areas(v)