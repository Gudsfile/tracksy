import json
from datetime import datetime
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

from rich import get_console, print
from rich.progress import track

from ..models.spotify import Streaming

_console = get_console()


class SpotifyWriter:
    max_chunk_size: int = 20000
    chunked_zip_file_name_template: str = "Streaming_History_Audio_2006-{reference_year}_{num_records}.json"
    chunked_zip_folder: str = "Spotify Extended Streaming History"

    def __init__(self, output_dir: Path, reference_date: datetime) -> None:
        folder = output_dir / "spotify"
        self.json_path_template: str = str(folder) + "/Streaming_History_Audio_2006_{num_records}.json"
        self.zip_path_template: str = str(folder) + "/streamings_{num_records}.zip"
        self.reference_date = reference_date

    def write(self, records):
        json_path = Path(self.json_path_template.format(num_records=str(len(records))))
        print(f"Write json: [yellow]starting[/yellow] {json_path.absolute()} ({len(records)} records)")
        write_json(json_path, records)
        print(f"Write json: [green]success[/green] {json_path.absolute()} ({len(records)} records)")

        chunk_size = int(max(len(records) / max(len(records) / self.max_chunk_size, 4), 10))
        files_for_chunked_zip = {}
        for i in range(0, len(records), chunk_size):
            chunk = records[i : i + chunk_size]
            filename = self.chunked_zip_file_name_template
            filename = filename.replace("{num_records}", str(i // chunk_size + 1))
            filename = filename.replace("{reference_year}", str(self.reference_date.year))
            files_for_chunked_zip[filename] = chunk

        zip_path = Path(self.zip_path_template.format(num_records=str(len(records))))
        print(f"Write zip: [yellow]starting[/yellow] {zip_path.absolute()} ({len(files_for_chunked_zip)} files)")
        write_zip(zip_path, files_for_chunked_zip, self.chunked_zip_folder, self.reference_date)
        print(f"Write zip: [green]success[/green] {zip_path.absolute()}")


def write_json(path: Path, streamings: list[Streaming]):
    data = [
        streaming.model_dump(mode="json") for streaming in track(streamings, description=f"📦 Preparing {path.name}")
    ]

    path.parent.mkdir(parents=True, exist_ok=True)

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, sort_keys=True)


def write_zip(path: Path, files_to_add: dict[str, list[Streaming]], base_zipped_folder: str, date: datetime):
    path.parent.mkdir(parents=True, exist_ok=True)

    sorted_files = sorted(files_to_add.items())

    with _console.status("🗜️ Zipping files..."), ZipFile(path, "w", ZIP_DEFLATED, compresslevel=6) as myzip:
        for filename, streamings in sorted_files:
            data = [streaming.model_dump(mode="json") for streaming in streamings]
            json_content = json.dumps(data, indent=4, sort_keys=True)

            archive_name = str(Path(base_zipped_folder) / filename)
            zip_info = ZipInfo(archive_name)
            zip_info.compress_type = ZIP_DEFLATED
            zip_info.date_time = (date.year, date.month, date.day, date.hour, date.minute, date.second)

            myzip.writestr(zip_info, json_content)
