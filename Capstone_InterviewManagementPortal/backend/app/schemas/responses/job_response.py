from pydantic import BaseModel

class JobResponse(BaseModel):
    id: str
    title: str
    job_details: str
    job_role: str
    required_skills: str
    experience_required: str
    employment_type: str
    location: str
