from pydantic import BaseModel, field_validator
from ...enums.user_role import UserRole

class UserUpdateRequest(BaseModel):
    name: str
    role: UserRole
    active: bool

    @field_validator("name")
    @classmethod
    def name_must_be_valid(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name cannot be blank")
        if len(v) > 100:
            raise ValueError("Name must not exceed 100 characters")
        return v
