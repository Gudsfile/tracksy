import random
import string
from dataclasses import dataclass
from datetime import datetime
from ipaddress import ip_address

from ..config import GenerationConfig
from ..models.deezer import DeezerStreaming
from .base import BaseFactory


@dataclass
class DeezerTrack:
    isrc: str
    song_title: str
    artist: str
    album_title: str
    duration_sec: int


class DeezerFactory(BaseFactory[DeezerStreaming]):
    def __init__(self, num_records: int, config: GenerationConfig) -> None:
        super().__init__(num_records, config)

        num_ip_addresses = 20

        print("💻 Generating platforms...")
        self.platforms = ["web", "ios", "android", "desktop", "tv"]

        print("🛜 Generating IPs...")
        self.ip_addresses = [ip_address(self.faker.ipv4()) for _ in range(num_ip_addresses)]

    def _generate_isrc(self) -> str:
        countries = ["US", "GB", "FR", "DE", "JP", "CA", "AU"]
        country = random.choice(countries)
        registrant = "".join(random.choices(string.ascii_uppercase + string.digits, k=3))
        year = str(self.now.year % 100).zfill(2)
        designation = str(random.randint(0, 99999)).zfill(5)
        return f"{country}{registrant}{year}{designation}"

    def _generate_catalog(self, num_records: int) -> list[DeezerTrack]:
        num_artists = max(int(num_records * 0.2), 1)
        num_albums = max(int(num_records * 0.3), 1)
        num_tracks = max(int(num_records * 0.5), 1)
        print(f" - records: {num_records}")
        print(f" - artists: {num_artists}")
        print(f" - albums : {num_albums}")
        print(f" - tracks : {num_tracks}")

        artists = [self.faker.name() for _ in range(num_artists)]
        album_names = [" ".join(self.faker.words(3)).title() for _ in range(num_albums)]
        albums = [(name, random.choice(artists)) for name in album_names]
        tracks = [
            DeezerTrack(
                isrc=self._generate_isrc(),
                song_title=" ".join(self.faker.words(4)).title(),
                artist=random.choice(albums)[1],
                album_title=random.choice(albums)[0],
                duration_sec=random.randint(self.TRACK_DURATION_MIN_MS // 1000, self.TRACK_DURATION_MAX_MS // 1000),
            )
            for _ in range(num_tracks)
        ]
        return tracks

    def _create_one_record(self, ts: datetime) -> DeezerStreaming:
        year_index = ts.year - self.start_year

        is_skipped = random.random() < self.skip_chance_trend[year_index]

        track = random.choice(self.weighted_tracks[ts.year])
        platform_name = random.choice(self.platforms)
        platform_model = "" if random.random() < 0.4 else self.faker.user_agent()

        return DeezerStreaming(
            song_title=track.song_title,
            artist=track.artist,
            isrc=track.isrc,
            album_title=track.album_title,
            ip_address=random.choice(self.ip_addresses),
            listening_time=random.randint(1, 29)
            if is_skipped
            else random.randint(int(track.duration_sec * 0.95), track.duration_sec),
            platform_name=platform_name,
            platform_model=platform_model,
            date=ts,
        )
