from enum import Enum

# Enum for user role
class UserRole(str, Enum):
    ADMIN = "Admin"
    HR = "HR"
    INTERVIEWER = "Interviewer"
