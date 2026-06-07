import time
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Annotated

import typer
from rich import print
from rich.panel import Panel
from rich.rule import Rule

from synthetic_datasets.config import GenerationConfig
from synthetic_datasets.factories.apple_music import AppleMusicFactory
from synthetic_datasets.factories.custom import CustomFactory
from synthetic_datasets.factories.deezer import DeezerFactory
from synthetic_datasets.factories.jellyfin import JellyFinFactory
from synthetic_datasets.factories.spotify import SpotifyFactory
from synthetic_datasets.writers.apple_music import AppleMusicWriter
from synthetic_datasets.writers.custom import CustomWriter
from synthetic_datasets.writers.deezer import DeezerWriter
from synthetic_datasets.writers.jellyfin import JellyFinWriter
from synthetic_datasets.writers.spotify import SpotifyWriter


class Provider(str, Enum):
    spotify = "spotify"
    deezer = "deezer"
    apple_music = "apple-music"
    jellyfin = "jellyfin"
    custom = "custom"


app = typer.Typer(add_completion=False)


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


def _jellyfin(num_records: int, output_dir: Path, config: GenerationConfig) -> None:
    factory = JellyFinFactory(num_records, config=config)
    writer = JellyFinWriter(output_dir=output_dir, reference_date=config.reference_date)
    writer.write(factory.create_streaming_history())


def _custom(num_records: int, output_dir: Path, config: GenerationConfig) -> None:
    factory = CustomFactory(num_records, config=config)
    writer = CustomWriter(output_dir=output_dir)
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

  generate 1000 --all-providers
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
        Provider | None,
        typer.Option(help="Streaming provider to generate data for"),
    ] = None,
    all_providers: Annotated[
        bool,
        typer.Option("--all-providers", help="Generate datasets for all providers"),
    ] = False,
) -> None:
    """Generate synthetic streaming datasets."""
    if all_providers and provider is not None:
        raise typer.BadParameter("Cannot use --all-providers with --provider")

    start = time.perf_counter()
    config = GenerationConfig.create(seed=seed, reference_date=reference_date)

    if all_providers:
        provider_fns = {
            Provider.spotify: _spotify,
            Provider.deezer: _deezer,
            Provider.apple_music: _apple_music,
            Provider.jellyfin: _jellyfin,
            Provider.custom: _custom,
        }
        errors: list[tuple[Provider, Exception]] = []
        for prov in Provider:
            fn = provider_fns[prov]
            print(Rule(f"[bold]{prov.value}[/bold]"))
            try:
                fn(num_records, output_dir, config)
            except Exception as e:
                errors.append((prov, e))
        if errors:
            for prov, e in errors:
                print(f"[red]Error generating {prov.value}: {e}[/red]")
            raise typer.Exit(code=1)
    else:
        match provider or Provider.spotify:
            case Provider.deezer:
                _deezer(num_records, output_dir, config)
            case Provider.apple_music:
                _apple_music(num_records, output_dir, config)
            case Provider.spotify:
                _spotify(num_records, output_dir, config)
            case Provider.jellyfin:
                _jellyfin(num_records, output_dir, config)
            case Provider.custom:
                _custom(num_records, output_dir, config)

    elapsed = time.perf_counter() - start
    print(Panel(f"Completed in [bold]{elapsed:.2f}s[/bold]", title="✨ Result", style="green"))
    config.log_config()


def main() -> None:
    app()


if __name__ == "__main__":
    main()
