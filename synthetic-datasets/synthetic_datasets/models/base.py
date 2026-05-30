from dataclasses import dataclass
from datetime import datetime


@dataclass
class BaseTrack:
    title: str
    artist: str
    album: str
    duration_ms: int


@dataclass
class BaseEvent:
    timestamp: datetime
    track_index: int
    is_skipped: bool
    duration_ratio: float
