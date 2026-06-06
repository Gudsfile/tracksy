from datetime import datetime

from pydantic import BaseModel, PastDatetime, field_serializer


class CustomStreaming(BaseModel):
    ts: PastDatetime
    track_name: str
    artist_name: str
    album_name: str
    ms_played: int
    track_uri: str
    platform: str

    @field_serializer("ts")
    def serialize_ts(self, ts: datetime) -> str:
        return ts.strftime("%Y-%m-%dT%H:%M:%SZ")
