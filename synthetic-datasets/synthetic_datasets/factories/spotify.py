import string
from datetime import timedelta
from ipaddress import ip_address
from typing import ClassVar

from ..config import GenerationConfig
from ..models.base import BaseEvent
from ..models.spotify import ReasonEndEnum, ReasonStartEnum, Streaming
from .base import BaseFactory


class SpotifyFactory(BaseFactory[Streaming]):
    reason_start: ClassVar[list[ReasonStartEnum]] = [
        ReasonStartEnum.TRACK_DONE,
        ReasonStartEnum.FORWARD_BUTTON,
        ReasonStartEnum.BACK_BUTTON,
        ReasonStartEnum.CLICK_ROW,
    ]
    _TRACK_URI_CHARS: ClassVar[str] = string.ascii_letters + string.digits

    def __init__(self, num_records: int, config: GenerationConfig) -> None:
        super().__init__(num_records, config)

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
        base = self._catalog[event.track_index]
        ts = event.timestamp
        ms_played = int(base.duration_ms * event.duration_ratio)
        is_offline = self.rng.random() < 0.1
        platform = self.rng.choice(self.platforms)
        uri_suffix = "".join(self.rng.choices(self._TRACK_URI_CHARS, k=22))
        return Streaming(
            ts=ts,
            platform=platform,
            ms_played=ms_played,
            conn_country=self.rng.choice(self.countries),
            ip_addr=self.rng.choice(self.ip_addr),
            master_metadata_track_name=base.title,
            master_metadata_album_artist_name=base.artist,
            master_metadata_album_album_name=base.album,
            spotify_track_uri=f"spotify:track:{uri_suffix}",
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
