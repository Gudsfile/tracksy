import json
from datetime import datetime
from pathlib import Path

from tqdm import tqdm

from ..models.funkwhale import FunkWhaleListen


class FunkWhaleWriter:
    def __init__(self, output_dir: Path, reference_date: datetime) -> None:
        self.output_path = output_dir / "funkwhale" / "funkwhale-history.json"
        self.reference_date = reference_date

    def write(self, records: list[FunkWhaleListen]) -> None:
        print(
            f"Write `json` file: status: `starting`, path: `{self.output_path.absolute()}`, count_records: `{len(records)}`"
        )
        self.output_path.parent.mkdir(parents=True, exist_ok=True)
        data = [
            _serialize_listen(listen)
            for listen in tqdm(records, desc=f"📦 Writing {self.output_path.name}", unit=" records")
        ]
        with open(self.output_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        print(
            f"Write `json` file: status: `success`, path: `{self.output_path.absolute()}`, count_records: `{len(records)}`"
        )


def _serialize_listen(listen: FunkWhaleListen) -> dict:
    track = listen.track
    return {
        "id": listen.id,
        "creation_date": listen.serialize_creation_date(listen.creation_date),
        "track": {
            "id": track.id,
            "title": track.title,
            "mbid": track.mbid,
            "duration": track.duration,
            "artist": {
                "id": track.artist.id,
                "name": track.artist.name,
                "mbid": track.artist.mbid,
            },
            "album": {
                "id": track.album.id,
                "title": track.album.title,
                "mbid": track.album.mbid,
            },
        },
    }
