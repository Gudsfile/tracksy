import uuid
from datetime import datetime

from pydantic import BaseModel, PastDatetime, field_serializer


class FunkWhaleArtist(BaseModel):
    id: int
    name: str
    mbid: str  # UUID4


class FunkWhaleAlbum(BaseModel):
    id: int
    title: str
    mbid: str  # UUID4


class FunkWhaleTrack(BaseModel):
    id: int
    title: str
    mbid: str  # UUID4
    duration: int  # seconds
    artist: FunkWhaleArtist
    album: FunkWhaleAlbum


class FunkWhaleListen(BaseModel):
    id: int
    creation_date: PastDatetime
    track: FunkWhaleTrack

    @field_serializer("creation_date")
    def serialize_creation_date(self, creation_date: datetime) -> str:
        return creation_date.strftime("%Y-%m-%dT%H:%M:%S.000Z")
