import uuid
from dataclasses import dataclass, field
from typing import Any, Optional


@dataclass
class SessionState:
    session_id: str
    selected_patient: Optional[str] = None
    observations: dict = field(default_factory=dict)  # identifier -> list of observations
    bundle: Any = None
    bundle_type: Optional[str] = None  # "batch" or "transaction"
    post_result: Optional[dict] = None


# In-memory store keyed by session_id
_sessions: dict[str, SessionState] = {}


def create_session() -> SessionState:
    session_id = str(uuid.uuid4())
    session = SessionState(session_id=session_id)
    _sessions[session_id] = session
    return session


def get_session(session_id: str) -> Optional[SessionState]:
    return _sessions.get(session_id)


def get_or_create_session(session_id: Optional[str] = None) -> SessionState:
    if session_id and session_id in _sessions:
        return _sessions[session_id]
    if session_id:
        session = SessionState(session_id=session_id)
        _sessions[session_id] = session
        return session
    return create_session()
