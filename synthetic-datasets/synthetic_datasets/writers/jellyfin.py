import csv
from datetime import datetime
from pathlib import Path

from tqdm import tqdm

from ..models.jellyfin import JellyFinRecord

COLUMNS = [
    "DateCreated",
    "UserId",
    "ItemId",
    "ItemType",
    "ItemName",
    "PlaybackMethod",
    "ClientName",
    "DeviceName",
    "PlayDuration",
]


class JellyFinWriter:
    def __init__(self, output_dir: Path, reference_date: datetime) -> None:
        self.output_path = output_dir / "jellyfin" / "playback_report.csv"
        self.reference_date = reference_date

    def write(self, records: list[JellyFinRecord]) -> None:
        print(
            f"Write `csv` file: status: `starting`, path: `{self.output_path.absolute()}`, count_records: `{len(records)}`"
        )
        self.output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.output_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=COLUMNS)
            writer.writeheader()
            for record in tqdm(records, desc=f"📦 Writing {self.output_path.name}", unit=" records"):
                writer.writerow(
                    {
                        "DateCreated": record.serialize_date_created(record.date_created),
                        "UserId": record.user_id,
                        "ItemId": record.item_id,
                        "ItemType": record.item_type,
                        "ItemName": record.item_name,
                        "PlaybackMethod": record.playback_method,
                        "ClientName": record.client_name,
                        "DeviceName": record.device_name,
                        "PlayDuration": str(record.play_duration),
                    }
                )
        print(
            f"Write `csv` file: status: `success`, path: `{self.output_path.absolute()}`, count_records: `{len(records)}`"
        )
