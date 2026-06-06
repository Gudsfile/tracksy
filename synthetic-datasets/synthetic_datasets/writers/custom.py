import csv
from pathlib import Path

from rich import get_console, print
from rich.progress import track

from ..models.custom import CustomStreaming

_console = get_console()

FILE_NAME = "tracksy-custom.csv"
COLUMNS = [
    "ts",
    "track_name",
    "artist_name",
    "album_name",
    "ms_played",
    "track_uri",
    "platform",
]


class CustomWriter:
    def __init__(self, output_dir: Path) -> None:
        self.output_path = output_dir / "custom" / FILE_NAME

    def write(self, records: list[CustomStreaming]) -> None:
        with _console.status("🖍️ Writing csv..."):
            self.output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(self.output_path, "w", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=COLUMNS)
                writer.writeheader()
                for record in track(records, description=f"📦 Writing {self.output_path.name}"):
                    writer.writerow(
                        {
                            "ts": record.ts.strftime("%Y-%m-%dT%H:%M:%SZ"),
                            "track_name": record.track_name,
                            "artist_name": record.artist_name,
                            "album_name": record.album_name,
                            "ms_played": str(record.ms_played),
                            "track_uri": record.track_uri,
                            "platform": record.platform,
                        }
                    )
        print(f"🖍️ Write csv: [green]success[/green] {self.output_path.absolute()} ({len(records)} records)")
