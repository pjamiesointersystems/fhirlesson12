from pydantic import BaseModel
from typing import Optional


class SessionRequest(BaseModel):
    session_id: str
    identifier: str


class SyntheticObservationRequest(BaseModel):
    session_id: str
    identifier: str
    count: int = 50
