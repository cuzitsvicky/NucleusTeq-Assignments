from pydantic import BaseModel


class MessageResponse(BaseModel):
    message: str


class MessageWithIdResponse(MessageResponse):
    id: str
