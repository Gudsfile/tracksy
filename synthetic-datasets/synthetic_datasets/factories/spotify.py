from datetime import timedelta
from ipaddress import ip_address
from typing import ClassVar

from rich import get_console, print

from ..config import GenerationConfig
from ..models.base import BaseEvent
from ..models.spotify import Album, Artist, ReasonEndEnum, ReasonStartEnum, Streaming, Track
from .base import BaseFactory

_console = get_console()


class SpotifyFactory(BaseFactory[Streaming]):
    reason_start: ClassVar[list[ReasonStartEnum]] = [
        ReasonStartEnum.TRACK_DONE,
        ReasonStartEnum.FORWARD_BUTTON,
        ReasonStartEnum.BACK_BUTTON,
        ReasonStartEnum.CLICK_ROW,
    ]

    def __init__(self, num_records: int, config: GenerationConfig) -> None:
        super().__init__(num_records, config)

        with _console.status("🎵 Enriching Spotify catalog..."):
            self._spotify_catalog: list[Track] = [
                Track(
                    uri=f"spotify:track:{self.faker.uuid4().replace('-', '')[:22]}",
                    name=t.title,
                    album=Album(
                        name=t.album,
                        artist=Artist(name=t.artist),
                    ),
                    duration_ms=t.duration_ms,
                )
                for t in self._catalog
            ]

        num_platforms = 5
        num_countries = 5
        num_ip_addresses = 20

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
            for _ in range(0, num_platforms)
        ]

        print("🌏 Generating country codes...")
        self.countries = [self.faker.country_code() for _ in range(0, num_countries)]
        print("🛜 Generating IPs...")
        self.ip_addr = [ip_address(self.faker.ipv4()) for _ in range(0, num_ip_addresses)]

    def _map_event(self, event: BaseEvent) -> Streaming:
        track = self._spotify_catalog[event.track_index]
        ts = event.timestamp
        ms_played = int(track.duration_ms * event.duration_ratio)
        is_offline = self.rng.random() < 0.1
        platform = self.rng.choice(self.platforms)
        return Streaming(
            ts=ts,
            platform=platform,
            ms_played=ms_played,
            conn_country=self.rng.choice(self.countries),
            ip_addr=self.rng.choice(self.ip_addr),
            master_metadata_track_name=track.name,
            master_metadata_album_artist_name=track.album.artist.name,
            master_metadata_album_album_name=track.album.name,
            spotify_track_uri=track.uri,
            reason_start=self.rng.choice(self.reason_start),
            reason_end=ReasonEndEnum.FORWARD_BUTTON if event.is_skipped else ReasonEndEnum.TRACK_DONE,
            shuffle=bool(self.rng.getrandbits(1)),
            skipped=event.is_skipped,
            offline=is_offline,
            offline_timestamp=int((ts - timedelta(minutes=self.rng.randint(1, 60))).timestamp())
            if is_offline
            else None,
            incognito_mode=bool(self.rng.getrandbits(1)),
        )
