from pydantic import BaseModel
from .user_response import UserResponse

class LoginResponse(BaseModel):
    user: UserResponse
    token: str
