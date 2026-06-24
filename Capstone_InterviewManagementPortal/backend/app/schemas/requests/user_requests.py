from pydantic import BaseModel, EmailStr, field_validator
import re


class LoginRequest(BaseModel):
    email: EmailStr  # validates email format
    password: str  

class PasswordResetRequest(BaseModel):
    new_password: str  

    @field_validator("new_password")   
    @classmethod
    def password_must_be_valid(cls, v: str) -> str:
        """
        Validates the password.

        Args:
            v (str): Password to validate
        
        Returns:
            str: Validated password
        
        Raises:
            ValueError: If the password is not valid
        """
        if not (6 <= len(v) <= 12):
            raise ValueError("Password must be between 6 and 12 characters")
        if not re.search(r"[A-Za-z]", v):
            raise ValueError("Password must contain at least one letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        return v
