from enum import Enum


class UserRole(str, Enum):
    ADMIN = "Admin"
    HR = "HR"
    INTERVIEWER = "Interviewer"
