import json
from os.path import basename
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

from tqdm import tqdm

from ..models.spotify import Streaming


class SpotifyWriter:
    max_chunk_size: int = 20000
    chunked_zip_file_name_template: str = "Streaming_History_Audio_2006-2025_{num_records}.json"
    chunked_zip_folder: str = "Spotify Extended Streaming History"

    def __init__(self, output_dir: Path) -> None:
        folder = output_dir / "spotify"
        self.json_path_template: str = str(folder) + "/streamings_{num_records}.json"
        self.zip_path_template: str = str(folder) + "/streamings_{num_records}.zip"

    def write(self, records):
        json_path = Path(self.json_path_template.format(num_records=str(len(records))))
        print(f"Write `json` file: status: `starting`, path: `{json_path.absolute()}`, count_records: `{len(records)}`")
        write_json(json_path, records)
        print(f"Write `json` file: status: `success`, path: `{json_path.absolute()}`, count_records: `{len(records)}`")

        chunk_size = int(max(len(records) / max(len(records) / self.max_chunk_size, 4), 10))
        files_for_chunked_zip = {}
        for i in range(0, len(records), chunk_size):
            chunk = records[i : i + chunk_size]
            filename = self.chunked_zip_file_name_template.replace("{num_records}", str(i // chunk_size + 1))
            files_for_chunked_zip[filename] = chunk

        zip_path = Path(self.zip_path_template.format(num_records=str(len(records))))
        print(
            f"Write `zip` file: status: `starting`, path: `{zip_path.absolute()}`, count_files: `{len(files_for_chunked_zip)}`"
        )
        write_zip(zip_path, files_for_chunked_zip, self.chunked_zip_folder)
        print(f"Write `zip` file: status: `success`, path: `{zip_path.absolute()}`")


def write_json(path: Path, streamings: list[Streaming]):
    data = [
        streaming.model_dump(mode="json")
        for streaming in tqdm(streamings, desc=f"📦 Preparing {path.name}", unit=" records")
    ]

    path.parent.mkdir(parents=True, exist_ok=True)

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)


def write_zip(path: Path, files_to_add: dict[str, list[Streaming]], base_zipped_folder: str | None = None):
    temp_dir = path.parent / "temp_json_files"
    temp_dir.mkdir(parents=True, exist_ok=True)

    with ZipFile(path, "w", ZIP_DEFLATED) as myzip:
        for filename, streamings in tqdm(files_to_add.items(), desc="🗜️ Zipping files", unit=" file"):
            temp_file_path = temp_dir / filename

            write_json(temp_file_path, streamings)
            myzip.write(
                temp_file_path,
                Path(base_zipped_folder) / basename(temp_file_path) if base_zipped_folder else basename(temp_file_path),
            )
            temp_file_path.unlink()

    temp_dir.rmdir()
