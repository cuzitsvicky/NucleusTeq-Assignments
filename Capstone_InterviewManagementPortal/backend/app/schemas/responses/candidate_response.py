from pydantic import BaseModel, EmailStr

class CandidateResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: EmailStr
    mobile: str
    current_company: str
    total_experience: str
    applied_job_id: str
    resume_id: str | None = None
    resume_filename: str | None = None
    status: str
    job_title: str | None = None
