import string
from dataclasses import dataclass
from ipaddress import ip_address

from ..config import GenerationConfig
from ..models.base import BaseEvent
from ..models.deezer import DeezerStreaming
from .base import BaseFactory


@dataclass
class _DeezerTrack:
    isrc: str
    title: str
    artist: str
    album_title: str
    duration_sec: int


class DeezerFactory(BaseFactory[DeezerStreaming]):
    def __init__(self, num_records: int, config: GenerationConfig) -> None:
        super().__init__(num_records, config)

        print("🎵 Enriching Deezer catalog...")
        self._deezer_catalog: list[_DeezerTrack] = [
            _DeezerTrack(
                isrc=self._generate_isrc(),
                title=t.title,
                artist=t.artist,
                album_title=t.album,
                duration_sec=t.duration_ms // 1000,
            )
            for t in self._catalog
        ]

        print("💻 Generating platforms...")
        self.platforms = ["web", "ios", "android", "desktop", "tv"]

        print("🛜 Generating IPs...")
        self.ip_addresses = [ip_address(self.faker.ipv4()) for _ in range(20)]

    def _generate_isrc(self) -> str:
        countries = ["US", "GB", "FR", "DE", "JP", "CA", "AU"]
        country = self.rng.choice(countries)
        registrant = "".join(self.rng.choices(string.ascii_uppercase + string.digits, k=3))
        year = str(self.now.year % 100).zfill(2)
        designation = str(self.rng.randint(0, 99999)).zfill(5)
        return f"{country}{registrant}{year}{designation}"

    def _map_event(self, event: BaseEvent) -> DeezerStreaming:
        track = self._deezer_catalog[event.track_index]
        listening_time = int(track.duration_sec * event.duration_ratio)
        platform_name = self.rng.choice(self.platforms)
        platform_model = "" if self.rng.random() < 0.4 else self.faker.user_agent()
        return DeezerStreaming(
            song_title=track.title,
            artist=track.artist,
            isrc=track.isrc,
            album_title=track.album_title,
            ip_address=self.rng.choice(self.ip_addresses),
            listening_time=listening_time,
            platform_name=platform_name,
            platform_model=platform_model,
            date=event.timestamp,
        )
