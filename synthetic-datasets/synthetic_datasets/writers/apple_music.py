import csv
from datetime import datetime
from pathlib import Path
from typing import ClassVar

from tqdm import tqdm

from ..models.apple_music import AppleMusicRecord

COLUMNS = [
    "Event Start Timestamp",
    "Song Name",
    "Album Name",
    "Container Artist Name",
    "Media Type",
    "Play Duration Milliseconds",
    "Device Type",
    "Container Origin Type",
]


class AppleMusicWriter:
    NULL_VALUE: ClassVar[str] = ""

    def __init__(self, output_dir: Path, reference_date: datetime) -> None:
        self.output_path = output_dir / "apple_music" / "Apple Music Play Activity.csv"
        self.reference_date = reference_date

    def write(self, records: list[AppleMusicRecord]) -> None:
        print(
            f"Write `csv` file: status: `starting`, path: `{self.output_path.absolute()}`, count_records: `{len(records)}`"
        )
        self.output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.output_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=COLUMNS)
            writer.writeheader()
            for record in tqdm(
                records,
                desc=f"📦 Writing {self.output_path.name}",
                unit=" records",
            ):
                writer.writerow(
                    {
                        "Event Start Timestamp": record.serialize_event_start_timestamp(record.event_start_timestamp),
                        "Song Name": record.song_name,
                        "Album Name": record.album_name,
                        "Container Artist Name": self.NULL_VALUE,
                        "Media Type": record.media_type,
                        "Play Duration Milliseconds": str(record.play_duration_ms),
                        "Device Type": record.device_type,
                        "Container Origin Type": record.container_origin_type or self.NULL_VALUE,
                    }
                )
        print(
            f"Write `csv` file: status: `success`, path: `{self.output_path.absolute()}`, count_records: `{len(records)}`"
        )
