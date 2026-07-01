from pydantic import BaseModel, EmailStr, field_validator
from ...constants.app_constants import REQUIRED_EMAIL_DOMAIN
from ...enums.user_role import UserRole
import re

class UserCreateRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole

    @field_validator("name")
    @classmethod
    def name_must_be_valid(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name cannot be blank")
        if len(v) <= 3:
            raise ValueError("Name must be greater than 3 characters")
        if len(v) >= 100:
            raise ValueError("Name must be less than 100 characters")
        return v

    @field_validator("email")
    @classmethod
    def email_must_be_nucleusteq(cls, v: str) -> str:
        v = v.strip().lower()
        if not v.endswith(f"@{REQUIRED_EMAIL_DOMAIN}"):
            raise ValueError(f"Email must use the {REQUIRED_EMAIL_DOMAIN} domain")
        return v
    
    @field_validator('email')
    @classmethod
    def reject_strange_characters(cls, v: str) -> str:
        # Enforce that the local part only contains normal letters, numbers, dots, or single hyphens/underscores
        local_part = v.split('@')[0]
        if not re.match(r"^[a-zA-Z0-9.]+$", local_part):
            raise ValueError("Email contains unaccepted special characters")
        return v

    @field_validator("password")
    @classmethod
    def password_must_be_valid(cls, v: str) -> str:
        if not (6 <= len(v) <= 12):
            raise ValueError("Password must be between 6 and 12 characters")
        if not re.search(r"[A-Za-z]", v):
            raise ValueError("Password must contain at least one letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        return v
