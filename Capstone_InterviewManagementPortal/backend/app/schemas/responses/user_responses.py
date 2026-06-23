from pydantic import BaseModel
from ...enums.user_role import UserRole


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole
    active: bool
    reset_required: bool


class LoginResponse(BaseModel):
    user: UserResponse
    token: str
