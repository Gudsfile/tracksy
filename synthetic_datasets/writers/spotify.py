import json
from pathlib import Path
from zipfile import ZipFile

from ..models.spotify import Streaming

DEFAULT_PREFIX = "Streaming_History_Audio"
DEFAULT_EXTENSION = ".json"
DEFAULT_FOLDER = "spotify"


def write(streamings: list[Streaming], path: Path):
    data = [streaming.model_dump() for streaming in streamings]
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w") as f:
        json.dump(data, f, default=str, indent=2)


def write_zip(streamings: list[list[Streaming]], folder: Path):
    zip_files = [
        {
            "path": Path(f"datasets/{DEFAULT_FOLDER}/one_file_one_year.zip"),
            "streaming_files": [
                {
                    "path": Path(f"datasets/{DEFAULT_FOLDER}/{DEFAULT_PREFIX}_2024{DEFAULT_EXTENSION}"),
                    "streamings": streamings[0],
                }
            ],
        },
        {
            "path": Path(f"datasets/{DEFAULT_FOLDER}/one_file_multiple_years.zip"),
            "streaming_files": [
                {
                    "streamings": streamings[1],
                    "path": Path(f"datasets/{DEFAULT_FOLDER}/{DEFAULT_PREFIX}_2020-2025{DEFAULT_EXTENSION}"),
                }
            ],
        },
        {
            "path": Path(f"datasets/{DEFAULT_FOLDER}/multiple_files.zip"),
            "streaming_files": [
                {
                    "streamings": streamings[0],
                    "path": Path(f"datasets/{DEFAULT_FOLDER}/{DEFAULT_PREFIX}_2020-2025_0{DEFAULT_EXTENSION}"),
                }
            ]
            + [
                {
                    "streamings": streaming,
                    "path": Path(f"datasets/{DEFAULT_FOLDER}/{DEFAULT_PREFIX}_2025_{index+1}{DEFAULT_EXTENSION}"),
                }
                for index, streaming in enumerate(streamings[1:])
            ],
        },
    ]
    for zip_file in zip_files:
        with ZipFile(zip_file["path"], "w") as myzip:
            for streaming_file in zip_file["streaming_files"]:
                write(streaming_file["streamings"], streaming_file["path"])
                myzip.write(streaming_file["path"])
                streaming_file["path"].unlink()
