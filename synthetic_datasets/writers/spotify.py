import json
from pathlib import Path

from ..models.spotify import Streaming

DEFAULT_PREFIX = "Streaming_History_Audio"
DEFAULT_EXTENSION = ".json"
DEFAULT_FOLDER = "spotify"


def write(streamings: list[Streaming], path: Path):
    data = [streaming.model_dump() for streaming in streamings]
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w") as f:
        json.dump(data, f, default=str, indent=2)
