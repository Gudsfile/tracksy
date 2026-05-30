import time
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Annotated

import typer

from synthetic_datasets.config import GenerationConfig
from synthetic_datasets.factories.apple_music import AppleMusicFactory
from synthetic_datasets.factories.deezer import DeezerFactory
from synthetic_datasets.factories.spotify import SpotifyFactory
from synthetic_datasets.writers.apple_music import AppleMusicWriter
from synthetic_datasets.writers.deezer import DeezerWriter
from synthetic_datasets.writers.spotify import SpotifyWriter


class Provider(str, Enum):
    spotify = "spotify"
    deezer = "deezer"
    apple_music = "apple-music"


app = typer.Typer()


def _apple_music(num_records: int, output_dir: Path, config: GenerationConfig) -> None:
    factory = AppleMusicFactory(num_records, config=config)
    writer = AppleMusicWriter(output_dir=output_dir, reference_date=config.reference_date)
    writer.write(factory.create_streaming_history())


def _spotify(num_records: int, output_dir: Path, config: GenerationConfig) -> None:
    factory = SpotifyFactory(num_records, config=config)
    writer = SpotifyWriter(output_dir=output_dir, reference_date=config.reference_date)
    writer.write(factory.create_streaming_history())


def _deezer(num_records: int, output_dir: Path, config: GenerationConfig) -> None:
    factory = DeezerFactory(num_records, config=config)
    writer = DeezerWriter(output_dir=output_dir, reference_date=config.reference_date)
    writer.write(factory.create_streaming_history())


def _validate_num_records(value: int) -> int:
    if value < 100:
        raise typer.BadParameter("Minimal value is: 100")
    return value


@app.command(
    epilog="""
Examples:

  generate 1000

  generate 1000 --seed 42
"""
)
def generate(
    num_records: Annotated[
        int,
        typer.Argument(help="Number of lines to be generated (>= 100)", callback=_validate_num_records),
    ],
    output_dir: Annotated[
        Path,
        typer.Option("-o", "--output-dir", help="Output directory for generated datasets"),
    ] = Path("datasets"),
    seed: Annotated[int | None, typer.Option(help="Seed for reproducible generation")] = None,
    reference_date: Annotated[
        datetime | None,
        typer.Option(help="Overwrite reference date in ISO format (e.g., 2026-02-08 or 2026-02-08T14:30:00)"),
    ] = None,
    provider: Annotated[
        Provider,
        typer.Option(help="Streaming provider to generate data for"),
    ] = Provider.spotify,
) -> None:
    """Generate synthetic streaming datasets."""
    start = time.time()

    config = GenerationConfig.create(seed=seed, reference_date=reference_date)
    config.log_config()

    match provider:
        case Provider.deezer:
            _deezer(num_records, output_dir, config)
        case Provider.apple_music:
            _apple_music(num_records, output_dir, config)
        case Provider.spotify:
            _spotify(num_records, output_dir, config)

    typer.echo(f"--- {time.time() - start:.2f} seconds ---")


def main() -> None:
    app()


if __name__ == "__main__":
    main()
