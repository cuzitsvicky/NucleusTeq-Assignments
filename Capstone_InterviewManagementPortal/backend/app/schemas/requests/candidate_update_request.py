from pydantic import BaseModel, EmailStr, field_validator
import re

class CandidateUpdateRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    mobile: str
    current_company: str
    total_experience: str
    applied_job_id: str

    @field_validator("first_name", "last_name")
    @classmethod
    def name_must_be_valid(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name cannot be blank")
        if len(v) > 50:
            raise ValueError("Name must not exceed 50 characters")
        if not re.match(r"^[A-Za-z\s\-']+$", v):
            raise ValueError("Name must contain only letters, spaces, or hyphens")
        return v

    @field_validator("email")
    @classmethod
    def email_lowercase(cls, v: str) -> str:
        return v.strip().lower()

    @field_validator("mobile")
    @classmethod
    def mobile_must_be_valid(cls, v: str) -> str:
        digits = re.sub(r"[\s\-]", "", v)
        if not digits.isdigit():
            raise ValueError("Mobile number must contain only digits")
        if len(digits) < 7:
            raise ValueError("Mobile number must be at least 7 digits")
        if len(digits) > 10:
            raise ValueError("Mobile number must not exceed 10 digits")
        return digits

    @field_validator("current_company")
    @classmethod
    def company_must_not_be_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Current company cannot be blank")
        return v

    @field_validator("total_experience")
    @classmethod
    def experience_format(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Total experience cannot be blank")
        pattern = (
            r"^\d+(\.\d+)?(\s*-\s*\d+(\.\d+)?)?\s*(year|years|yr|yrs|month|months)$"
        )
        if not re.match(pattern, v, re.IGNORECASE):
            raise ValueError('Experience must follow format like "3 years", "6 months"')
        return v
