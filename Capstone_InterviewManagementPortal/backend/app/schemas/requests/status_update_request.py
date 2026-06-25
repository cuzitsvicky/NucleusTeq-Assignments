from pydantic import BaseModel
from ...enums.candidate_status import CandidateStatus

class StatusUpdateRequest(BaseModel):
    status: CandidateStatus
