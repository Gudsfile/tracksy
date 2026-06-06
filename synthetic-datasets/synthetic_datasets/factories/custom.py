import re
from dataclasses import dataclass

from rich import print

from ..config import GenerationConfig
from ..models.base import BaseEvent
from ..models.custom import CustomStreaming
from .base import BaseFactory

_SLUG_RE = re.compile(r"[^a-z0-9]+")


def _slugify(text: str) -> str:
    return _SLUG_RE.sub("-", text.lower()).strip("-")


@dataclass
class _CustomTrack:
    track_uri: str
    title: str
    artist: str
    album: str
    duration_ms: int


class CustomFactory(BaseFactory[CustomStreaming]):
    def __init__(self, num_records: int, config: GenerationConfig) -> None:
        super().__init__(num_records, config)

        print("🎵 Enriching Custom catalog...")
        self._custom_catalog: list[_CustomTrack] = [
            _CustomTrack(
                track_uri=f"custom:{_slugify(t.artist)}:{_slugify(t.title)}",
                title=t.title,
                artist=t.artist,
                album=t.album,
                duration_ms=t.duration_ms,
            )
            for t in self._catalog
        ]

        num_platforms = 5
        print("💻 Generating platforms...")
        self.platforms = [
            self.faker.random_element(
                [
                    self.faker.android_platform_token(),
                    self.faker.ios_platform_token(),
                    self.faker.linux_platform_token(),
                    self.faker.mac_platform_token(),
                    self.faker.windows_platform_token(),
                ]
            )
            for _ in range(num_platforms)
        ]

    def _map_event(self, event: BaseEvent) -> CustomStreaming:
        track = self._custom_catalog[event.track_index]
        return CustomStreaming(
            ts=event.timestamp,
            track_name=track.title,
            artist_name=track.artist,
            album_name=track.album,
            ms_played=int(track.duration_ms * event.duration_ratio),
            track_uri=track.track_uri,
            platform=self.rng.choice(self.platforms),
        )
