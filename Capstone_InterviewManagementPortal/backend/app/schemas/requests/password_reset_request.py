from pydantic import BaseModel, field_validator
import re


class PasswordResetRequest(BaseModel):
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_must_be_valid(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("New password cannot be blank")
        if not (6 <= len(v) <= 12):
            raise ValueError("Password must be between 6 and 12 characters")
        if not re.search(r"[A-Za-z]", v):
            raise ValueError("Password must contain at least one letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        if not re.search(r"[^A-Za-z0-9]", v):
            raise ValueError("Password must contain at least one special character")
        return v
