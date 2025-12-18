import csv
from pathlib import Path

from tqdm import tqdm

from ..models.applemusic import AppleMusicPlayHistoryRecord


class AppleMusicWriter:
    """
    Writer for Apple Music play history data.
    Generates CSV format matching Apple's export: "Apple Music - Play History Daily Tracks.csv"
    """

    csv_filename: str = "Apple Music - Play History Daily Tracks.csv"

    def __init__(self, output_dir: Path) -> None:
        folder = output_dir / "applemusic"
        self.csv_path = folder / self.csv_filename

    def write(self, records: list[AppleMusicPlayHistoryRecord]):
        """Write records to CSV file"""
        print(f"Write `csv` file: status: `starting`, path: `{self.csv_path}`, count_records: `{len(records)}`")

        self.csv_path.parent.mkdir(parents=True, exist_ok=True)

        # CSV headers matching Apple Music export format
        headers = [
            "Country",
            "Track Identifier",
            "Media type",
            "Date Played",
            "Hours",
            "Play Duration Milliseconds",
            "End Reason Type",
            "Source Type",
            "Play Count",
            "Skip Count",
            "Ignore For Recommendations",
            "Track Reference",
            "Track Description",
        ]

        with open(self.csv_path, "w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=headers)
            writer.writeheader()

            for record in tqdm(records, desc=f"📦 Writing {self.csv_path.name}", unit=" records"):
                # Convert model to dict with proper field names
                row = {
                    "Country": record.country,
                    "Track Identifier": record.track_identifier if record.track_identifier else 0,
                    "Media type": record.media_type,
                    "Date Played": record.serialize_date_played(record.date_played),
                    "Hours": record.hours,
                    "Play Duration Milliseconds": record.play_duration_milliseconds,
                    "End Reason Type": record.serialize_end_reason(record.end_reason_type),
                    "Source Type": record.serialize_source(record.source_type),
                    "Play Count": record.play_count,
                    "Skip Count": record.skip_count,
                    "Ignore For Recommendations": record.ignore_for_recommendations,
                    "Track Reference": record.track_reference,
                    "Track Description": record.track_description,
                }
                writer.writerow(row)

        print(f"Write `csv` file: status: `success`, path: `{self.csv_path}`")
