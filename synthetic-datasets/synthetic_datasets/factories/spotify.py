import random
import string
from datetime import datetime, timedelta
from ipaddress import ip_address

from ..config import GenerationConfig
from ..models.spotify import Album, Artist, ReasonEndEnum, ReasonStartEnum, Streaming, Track
from .base import BaseFactory


class SpotifyFactory(BaseFactory[Streaming]):
    reason_start = [
        ReasonStartEnum.TRACK_DONE,
        ReasonStartEnum.FORWARD_BUTTON,
        ReasonStartEnum.BACK_BUTTON,
        ReasonStartEnum.CLICK_ROW,
    ]

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
        print("🛜 Generatin IPs...")
        self.ip_addr = [ip_address(self.faker.ipv4()) for _ in range(0, num_ip_addresses)]

    def _generate_catalog(self, num_records: int) -> list[Track]:
        num_artists = max(int(num_records * 0.2), 1)
        num_albums = max(int(num_records * 0.3), 1)
        num_tracks = max(int(num_records * 0.5), 1)
        print(f" - records: {num_records}")
        print(f" - artists: {num_artists}")
        print(f" - albums : {num_albums}")
        print(f" - tracks : {num_tracks}")

        track_uri_chars = string.ascii_letters + string.digits
        artists = [Artist(name=self.faker.name()) for _ in range(num_artists)]
        albums = [
            Album(name=" ".join(self.faker.words(3)).title(), artist=random.choice(artists)) for _ in range(num_albums)
        ]
        tracks = [
            Track(
                uri=f"spotify:track:{''.join(random.choices(track_uri_chars, k=22))}",
                name=" ".join(self.faker.words(4)).title(),
                album=random.choice(albums),
                duration_ms=random.randint(self.TRACK_DURATION_MIN_MS, self.TRACK_DURATION_MAX_MS),
            )
            for _ in range(num_tracks)
        ]
        return tracks

    def _create_one_record(self, ts: datetime) -> Streaming:
        year_index = ts.year - self.start_year

        is_skipped = random.random() < self.skip_chance_trend[year_index]
        is_offline = random.random() < 0.1

        track = random.choice(self.weighted_tracks[ts.year])
        platform = random.choice(self.platforms)

        return Streaming(
            ts=ts,
            platform=platform,
            ms_played=random.randint(1000, 29000) if is_skipped else int(track.duration_ms * random.uniform(0.95, 1.0)),
            conn_country=random.choice(self.countries),
            ip_addr=random.choice(self.ip_addr),
            master_metadata_track_name=track.name,
            master_metadata_album_artist_name=track.album.artist.name,
            master_metadata_album_album_name=track.album.name,
            spotify_track_uri=track.uri,
            reason_start=random.choice(self.reason_start),
            reason_end=ReasonEndEnum.FORWARD_BUTTON if is_skipped else ReasonEndEnum.TRACK_DONE,
            shuffle=bool(random.getrandbits(1)),
            skipped=is_skipped,
            offline=is_offline,
            offline_timestamp=int((ts - timedelta(minutes=random.randint(1, 60))).timestamp()) if is_offline else None,
            incognito_mode=bool(random.getrandbits(1)),
        )
