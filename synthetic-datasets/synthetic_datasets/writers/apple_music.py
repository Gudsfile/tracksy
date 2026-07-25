import csv
import io
from datetime import datetime
from pathlib import Path
from typing import ClassVar
from zipfile import ZIP_DEFLATED, ZIP_STORED, ZipFile, ZipInfo

from rich import get_console, print
from rich.progress import track

from ..models.apple_music import AppleMusicRecord

_console = get_console()

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

# A real Apple privacy export is a nested ZIP. A single export is delivered as:
#   {language_dependent_name}.zip
#     └── Apple_Media_Services.zip
#           └── Apple Music Activity/
#                 └── Apple Music Play Activity.csv
CSV_NAME = "Apple Music Play Activity.csv"
ACTIVITY_FOLDER = "Apple Music Activity"
MEDIA_SERVICES_ZIP_NAME = "Apple_Media_Services.zip"

# The outer per-export archive name is language dependent in real exports; we use
# a realistic, fixed value so output is deterministic.
EXPORT_ZIP_STEM = "Apple Media Services information"
EXPORT_ZIP_NAME = f"{EXPORT_ZIP_STEM}.zip"

# Apple delivers large histories as several export ZIPs (batches). Tracksy imports
# one file at a time, so multiple batches are combined into a single outer ZIP:
#   {combined}.zip
#     ├── {language_dependent_name} - Part 1 of N.zip -> Apple_Media_Services.zip -> ...
#     ├── {language_dependent_name} - Part 2 of N.zip -> Apple_Media_Services.zip -> ...
#     └── ...
COMBINED_ZIP_NAME = f"{EXPORT_ZIP_STEM} - combined parts.zip"

# Number of per-export batches packed into the combined ZIP. Fixed so every run
# produces the same set of outputs, no configuration required.
COMBINED_BATCHES = 3


class AppleMusicWriter:
    NULL_VALUE: ClassVar[str] = ""

    def __init__(self, output_dir: Path, reference_date: datetime) -> None:
        self.output_dir = output_dir / "apple_music"
        self.reference_date = reference_date
        self.csv_path = self.output_dir / CSV_NAME
        self.export_zip_path = self.output_dir / EXPORT_ZIP_NAME
        self.combined_zip_path = self.output_dir / COMBINED_ZIP_NAME

    def write(self, records: list[AppleMusicRecord]) -> None:
        self.output_dir.mkdir(parents=True, exist_ok=True)

        csv_bytes = self._csv_bytes(records)
        with _console.status("🖍️ Writing csv..."):
            self.csv_path.write_bytes(csv_bytes)
        print(f"🖍️ Write csv: [green]success[/green] {self.csv_path.absolute()} ({len(records)} records)")

        with _console.status("🗜️ Writing export zip..."):
            self.export_zip_path.write_bytes(self._export_zip_from_csv(csv_bytes))
        print(f"🖍️ Write export zip: [green]success[/green] {self.export_zip_path.absolute()} ({len(records)} records)")

        with _console.status("🗜️ Writing combined zip..."):
            self.combined_zip_path.write_bytes(self._build_combined_zip(records))
        print(
            f"🖍️ Write combined zip: [green]success[/green] {self.combined_zip_path.absolute()} "
            f"({len(records)} records, {COMBINED_BATCHES} exports)"
        )

    def _date_time(self) -> tuple[int, int, int, int, int, int]:
        d = self.reference_date
        return (d.year, d.month, d.day, d.hour, d.minute, d.second)

    def _csv_bytes(self, records: list[AppleMusicRecord]) -> bytes:
        buffer = io.StringIO()
        writer = csv.DictWriter(buffer, fieldnames=COLUMNS)
        writer.writeheader()
        for record in track(records, description=f"📦 Writing {CSV_NAME}"):
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
        return buffer.getvalue().encode("utf-8")

    def _zip_bytes(self, entries: list[tuple[str, bytes, bool]]) -> bytes:
        """Build a ZIP archive in memory from (archive_name, data, compress) entries."""
        buffer = io.BytesIO()
        with ZipFile(buffer, "w") as archive:
            for archive_name, data, compress in entries:
                info = ZipInfo(archive_name)
                info.date_time = self._date_time()
                info.compress_type = ZIP_DEFLATED if compress else ZIP_STORED
                archive.writestr(info, data)
        return buffer.getvalue()

    def _export_zip_from_csv(self, csv_bytes: bytes) -> bytes:
        """Wrap a play-activity CSV in the nested export ZIP (language_dependent_name.zip content)."""
        media_services_zip = self._zip_bytes([(f"{ACTIVITY_FOLDER}/{CSV_NAME}", csv_bytes, True)])
        # Inner ZIP is already compressed; store it to avoid pointless double work.
        return self._zip_bytes([(MEDIA_SERVICES_ZIP_NAME, media_services_zip, False)])

    def _build_export_zip(self, records: list[AppleMusicRecord]) -> bytes:
        """Build a single nested export ZIP (language_dependent_name.zip content)."""
        return self._export_zip_from_csv(self._csv_bytes(records))

    def _build_combined_zip(self, records: list[AppleMusicRecord]) -> bytes:
        """Combine several export ZIPs into one outer ZIP (a_zip_file.zip content)."""
        entries: list[tuple[str, bytes, bool]] = []
        for index, batch in enumerate(self._split(records), start=1):
            export_zip = self._build_export_zip(batch)
            entries.append((f"{EXPORT_ZIP_STEM} - Part {index} of {COMBINED_BATCHES}.zip", export_zip, False))
        return self._zip_bytes(entries)

    def _split(self, records: list[AppleMusicRecord]) -> list[list[AppleMusicRecord]]:
        base, extra = divmod(len(records), COMBINED_BATCHES)
        chunks: list[list[AppleMusicRecord]] = []
        start = 0
        for i in range(COMBINED_BATCHES):
            size = base + (1 if i < extra else 0)
            chunks.append(records[start : start + size])
            start += size
        return chunks
