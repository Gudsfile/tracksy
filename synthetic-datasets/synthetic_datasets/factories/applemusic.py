import random
from datetime import datetime

import numpy as np
from faker import Faker
from tqdm import tqdm

from ..models.applemusic import (
    AppleMusicPlayHistoryRecord,
    AppleMusicTrack,
    EndReasonTypeEnum,
    SourceTypeEnum,
)


class AppleMusicFactory:
    month_weights = [0.08, 0.07, 0.07, 0.06, 0.07, 0.08, 0.08, 0.08, 0.1, 0.10, 0.11, 0.1]

    hour_weights = [
        0.01, 0.01, 0.01, 0.01, 0.02, 0.04, 0.07, 0.09, 0.08, 0.06, 0.04, 0.04,
        0.05, 0.03, 0.04, 0.05, 0.05, 0.06, 0.07, 0.06, 0.05, 0.03, 0.02, 0.01,
    ]  # fmt: skip

    source_types = [
        SourceTypeEnum.MACINTOSH,
        SourceTypeEnum.IPHONE,
        SourceTypeEnum.IPAD,
        SourceTypeEnum.APPLE_WATCH,
    ]

    skip_chance_trend = np.linspace(0.15, 0.30, 6)

    def __init__(self, num_records: int):
        self.faker = Faker()
        self.now = datetime.now()
        self.start_year = 2020
        num_artists = max(int(num_records * 0.2), 1)
        num_tracks = max(int(num_records * 0.5), 1)
        num_countries = 5

        print("🎵 Generating Apple Music catalog...")
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

        print("🌏 Generating country codes...")
        self.countries = [self.faker.country_code() for _ in range(0, num_countries)]

    def _generate_catalog(self, num_artists: int, num_tracks: int) -> list[AppleMusicTrack]:
        artists = [self.faker.name() for _ in range(num_artists)]

        tracks = [
            AppleMusicTrack(
                track_id=random.randint(100000000, 999999999),  # Apple Music uses 9-digit IDs
                name=" ".join(self.faker.words(4)).title(),
                artist=random.choice(artists),
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

    def _create_one_play_history_record(self, ts: datetime) -> AppleMusicPlayHistoryRecord:
        year_index = ts.year - self.start_year

        is_skipped = random.random() < self.skip_chance_trend[year_index]
        track = random.choice(self.weighted_tracks[ts.year])

        play_count = 0 if is_skipped else 1
        skip_count = 1 if is_skipped else 0

        play_duration = (
            random.randint(1000, 29000) if is_skipped else int(track.duration_ms * random.uniform(0.95, 1.0))
        )

        if is_skipped:
            end_reason = random.choice(
                [
                    EndReasonTypeEnum.MANUALLY_SELECTED_PLAYBACK_OF_A_DIFF_ITEM,
                    EndReasonTypeEnum.PLAYBACK_MANUALLY_PAUSED,
                ]
            )
        else:
            end_reason = EndReasonTypeEnum.NATURAL_END_OF_TRACK

        track_id = track.track_id if random.random() > 0.05 else 0

        track_description = f"{track.artist} - {track.name}" if track_id != 0 else "N/A"

        return AppleMusicPlayHistoryRecord(
            country=random.choice(self.countries),
            track_identifier=track_id if track_id != 0 else None,
            media_type="N/A",
            date_played=ts,
            hours=ts.hour,
            play_duration_milliseconds=play_duration,
            end_reason_type=end_reason,
            source_type=random.choice(self.source_types),
            play_count=play_count,
            skip_count=skip_count,
            ignore_for_recommendations="",
            track_reference="N/A",
            track_description=track_description,
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

    def create_play_history(self) -> list[AppleMusicPlayHistoryRecord]:
        all_records = []

        for year, num_records_for_year in self.records_per_year.items():
            year_records = [
                self._create_one_play_history_record(self._get_random_datetime_for_year(year))
                for _ in tqdm(
                    range(num_records_for_year), desc=f"🍎 Generating Apple Music plays for {year}", leave=True
                )
            ]
            all_records.extend(year_records)

        return all_records

    def _rotate(self, elements, step):
        step = step % len(elements)
        return elements[step:] + elements[:step]
