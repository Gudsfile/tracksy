from datetime import datetime

from pydantic import BaseModel, IPvAnyAddress, PastDatetime, field_serializer


class DeezerStreaming(BaseModel):
    song_title: str
    artist: str
    isrc: str
    album_title: str
    ip_address: IPvAnyAddress  # ty: ignore[invalid-type-form]
    listening_time: int  # todo: seconds?
    platform_name: str
    platform_model: str
    date: PastDatetime  # todo: which format?

    @field_serializer("date")
    def serialize_date(self, date: datetime) -> str:
        return date.strftime("%Y-%m-%d %H:%M:%S")

    @field_serializer("ip_address")
    def serialize_ip_address(self, ip_address) -> str:
        return str(ip_address)
