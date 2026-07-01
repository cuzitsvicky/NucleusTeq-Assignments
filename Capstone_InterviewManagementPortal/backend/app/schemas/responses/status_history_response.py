from pydantic import BaseModel

class StatusHistoryResponse(BaseModel):
    id: str
    candidate_id: str
    status: str
    updated_by: str
    timestamp: str
