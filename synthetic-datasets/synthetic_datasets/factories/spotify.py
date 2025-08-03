import random
import string
from datetime import datetime, timedelta

import numpy as np
from faker import Faker
from tqdm import tqdm

from ..models.spotify import Album, Artist, ReasonEndEnum, ReasonStartEnum, Streaming, Track


class SpotifyFactory:
    month_weights = [0.08, 0.07, 0.07, 0.06, 0.07, 0.08, 0.08, 0.08, 0.1, 0.10, 0.11, 0.1]
    hour_weights = [
        0.01, 0.01, 0.01, 0.01, 0.02, 0.04, 0.07, 0.09, 0.08, 0.06, 0.04, 0.04,
        0.05, 0.03, 0.04, 0.05, 0.05, 0.06, 0.07, 0.06, 0.05, 0.03, 0.02, 0.01,
    ]  # fmt: skip
    reason_start = [
        ReasonStartEnum.TRACK_DONE,
        ReasonStartEnum.FORWARD_BUTTON,
        ReasonStartEnum.BACK_BUTTON,
        ReasonStartEnum.CLICK_ROW,
    ]
    skip_chance_trend = np.linspace(0.15, 0.30, 6)

    def __init__(self, num_records: int):
        self.faker = Faker()
        self.now = datetime.now()
        self.start_year = 2020
        num_artists = int(num_records * 0.2)
        num_albums = int(num_records * 0.3)
        num_tracks = int(num_records * 0.5)
        num_platforms = 5
        num_countries = 5
        num_ip_addresses = 20

        print("🎵 Generating music catalog...")
        print(f" - records: {num_records}")
        print(f" - artists: {num_artists}")
        print(f" - albums : {num_albums}")
        print(f" - tracks : {num_tracks}")
        self.tracks = self._generate_catalog(num_artists, num_albums, num_tracks)

        print("📈 Generating evolving listening tastes...")
        self.weighted_tracks = self._generate_weighted_tracks_by_year()
        for year, weighted_records in self.weighted_tracks.items():
            print(f" - {year}: {len(weighted_records)} records")

        print("📅 Generating distribution over year...")
        self.records_per_year = self._generate_distribution_over_year(num_records)
        for year, num_records in self.records_per_year.items():
            print(f" - {year}: {num_records} records")

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
        self.ip_addr = [self.faker.ipv4() for _ in range(0, num_ip_addresses)]

    def _generate_catalog(self, num_artists: int, num_albums: int, num_tracks: int) -> list[Track]:
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
                duration_ms=random.randint(120_000, 360_000),
            )
            for _ in range(num_tracks)
        ]
        return tracks

    def _generate_weighted_tracks_by_year(self) -> dict[int, list]:
        weighted_tracks_by_year = {}
        for year in range(self.start_year, self.now.year + 1):
            popularity = np.random.zipf(a=1.8, size=len(self.tracks))
            np.random.shuffle(popularity)

            weighted = []
            for track, weight in zip(self.tracks, popularity):
                repeats = min(int(weight / 10), 100)
                if repeats > 0:
                    weighted.extend([track] * repeats)

            weighted_tracks_by_year[year] = weighted

        return weighted_tracks_by_year

    def _get_random_datetime_for_year(self, year: int) -> datetime:
        while True:
            if year < self.now.year:
                months = range(1, 13)
                weights = self.month_weights
            else:
                valid_months = range(1, self.now.month + 1)
                valid_weights = self.month_weights[: self.now.month]
                weights = np.array(valid_weights) / sum(valid_weights)
                months = valid_months

            month = np.random.choice(months, p=weights)

            day = random.randint(1, 28)
            hour = np.random.choice(range(24), p=rotate(self.hour_weights, random.randint(0, 12)))
            minute = random.randint(0, 59)
            second = random.randint(0, 59)

            gen_date = datetime(year, month, day, hour, minute, second)

            if gen_date <= self.now:
                return gen_date

            gen_date = self.faker.date_time_between(start_date="-1y", end_date="now")
            if gen_date <= self.now:
                return gen_date
            print(f"Warning getting a random datetime for year once again: rejected_date: `{gen_date}`")

    def _create_one_streaming_record(self, ts: datetime) -> Streaming:
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

    def _generate_distribution_over_year(self, n_records):
        years = range(self.start_year, self.now.year + 1)

        year_weights = [random.uniform(0.5, 1.5) for _ in years]
        base_records_per_year = n_records / sum(year_weights)
        records_per_year = {
            year: int(base_records_per_year * year_weight) for year, year_weight in zip(years, year_weights)
        }
        records_per_year[self.now.year] += n_records - sum(records_per_year.values())
        return records_per_year

    def create_streaming_history(self) -> list[Streaming]:
        all_streamings = []

        for year, num_records_for_year in self.records_per_year.items():
            year_records = [
                self._create_one_streaming_record(self._get_random_datetime_for_year(year))
                for _ in tqdm(range(num_records_for_year), desc=f"💿 Generating streamings for {year}", leave=True)
            ]
            all_streamings.extend(year_records)

        return all_streamings


def rotate(elements, step):
    step = step % len(elements)
    return elements[step:] + elements[:step]
