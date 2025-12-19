import random
import string
from datetime import datetime

import numpy as np
from faker import Faker
from tqdm import tqdm

from ..models.deezer import DeezerListeningHistoryRecord, DeezerTrack


class DeezerFactory:
    month_weights = [0.08, 0.07, 0.07, 0.06, 0.07, 0.08, 0.08, 0.08, 0.1, 0.10, 0.11, 0.1]

    hour_weights = [
        0.01, 0.01, 0.01, 0.01, 0.02, 0.04, 0.07, 0.09, 0.08, 0.06, 0.04, 0.04,
        0.05, 0.03, 0.04, 0.05, 0.05, 0.06, 0.07, 0.06, 0.05, 0.03, 0.02, 0.01,
    ]  # fmt: skip

    platform_names = [
        "web",
        "android",
        "ios",
        "windows",
        "macos",
    ]

    platform_models = [
        "",
        "web",
        "web",
        "web",
        "iPhone 13",
        "Samsung Galaxy S21",
        "Pixel 7",
    ]

    skip_chance_trend = np.linspace(0.15, 0.30, 6)

    def __init__(self, num_records: int):
        self.faker = Faker()
        self.now = datetime.now()
        self.start_year = 2020
        num_artists = max(int(num_records * 0.2), 1)
        num_tracks = max(int(num_records * 0.5), 1)
        num_ip_addresses = 20

        print("🎵 Generating Deezer catalog...")
        print(f" - records: {num_records}")
        print(f" - artists: {num_artists}")
        print(f" - tracks : {num_tracks}")
        self.tracks = self._generate_catalog(num_artists, num_tracks)

        print("📈 Generating evolving listening tastes...")
        self.weighted_tracks = self._generate_weighted_tracks_by_year()
        for year, weighted_records in self.weighted_tracks.items():
            print(f" - {year}: {len(weighted_records)} records")

        print("📅 Generating distribution over year...")
        self.records_per_year = self._generate_distribution_over_year(num_records)
        for year, num_records in self.records_per_year.items():
            print(f" - {year}: {num_records} records")

        print("🛜 Generating IPs...")
        self.ip_addresses = [self.faker.ipv4() for _ in range(0, num_ip_addresses)]

    def _generate_isrc(self) -> str:
        """
        Generate a valid ISRC code.
        Format: CC-XXX-YY-NNNNN
        - CC: Country code (2 letters)
        - XXX: Registrant code (3 alphanumeric)
        - YY: Year (2 digits)
        - NNNNN: Designation code (5 digits)
        """
        country_code = random.choice(["US", "GB", "FR", "DE", "TC", "UK", "QM"])
        registrant = "".join(random.choices(string.ascii_uppercase + string.digits, k=3))
        year = random.randint(15, 24)  # 2015-2024
        designation = "".join(random.choices(string.digits, k=5))

        return f"{country_code}{registrant}{year:02d}{designation}"

    def _generate_catalog(self, num_artists: int, num_tracks: int) -> list[DeezerTrack]:
        artists = [self.faker.name() for _ in range(num_artists)]
        albums = [" ".join(self.faker.words(3)).title() for _ in range(max(num_tracks // 2, 1))]

        tracks = [
            DeezerTrack(
                song_title=" ".join(self.faker.words(4)).title(),
                artist=random.choice(artists),
                isrc=self._generate_isrc(),
                album_title=random.choice(albums),
                duration_seconds=random.randint(120, 360),  # 2-6 minutes
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
                else:
                    weighted.extend([track])

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
            hour = np.random.choice(range(24), p=self._rotate(self.hour_weights, random.randint(0, 12)))
            minute = random.randint(0, 59)
            second = random.randint(0, 59)

            gen_date = datetime(year, month, day, hour, minute, second)

            if gen_date <= self.now:
                return gen_date

            gen_date = self.faker.date_time_between(start_date="-1y", end_date="now")
            if gen_date <= self.now:
                return gen_date
            print(f"Warning getting a random datetime for year once again: rejected_date: `{gen_date}`")

    def _create_one_listening_record(self, ts: datetime) -> DeezerListeningHistoryRecord:
        year_index = ts.year - self.start_year

        is_skipped = random.random() < self.skip_chance_trend[year_index]
        track = random.choice(self.weighted_tracks[ts.year])

        listening_time = (
            random.randint(19000, 39000) if is_skipped else int(track.duration_ms * random.uniform(0.95, 1.0)),
        )

        platform_name = random.choice(self.platform_names)
        platform_model = random.choice(self.platform_models)

        return DeezerListeningHistoryRecord(
            song_title=track.song_title,
            artist=track.artist,
            isrc=track.isrc,
            album_title=track.album_title,
            ip_address=random.choice(self.ip_addresses),
            listening_time=listening_time,
            platform_name=platform_name,
            platform_model=platform_model,
            date=ts,
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

    def create_listening_history(self) -> list[DeezerListeningHistoryRecord]:
        all_records = []

        for year, num_records_for_year in self.records_per_year.items():
            year_records = [
                self._create_one_listening_record(self._get_random_datetime_for_year(year))
                for _ in tqdm(range(num_records_for_year), desc=f"🎧 Generating Deezer listens for {year}", leave=True)
            ]
            all_records.extend(year_records)

        return all_records

    def _rotate(self, elements, step):
        step = step % len(elements)
        return elements[step:] + elements[:step]
