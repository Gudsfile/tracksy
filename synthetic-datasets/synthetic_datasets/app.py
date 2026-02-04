import argparse
import time
from datetime import datetime
from pathlib import Path

from synthetic_datasets.config import GenerationConfig
from synthetic_datasets.factories.spotify import SpotifyFactory
from synthetic_datasets.writers.spotify import SpotifyWriter


def spotify(num_records: int, output_dir: Path, config: GenerationConfig):
    factory = SpotifyFactory(num_records, config=config)
    all_streamings = factory.create_streaming_history()

    writer = SpotifyWriter(output_dir=output_dir)
    writer.write(all_streamings)


def min_int(min_value):
    def checker(value):
        ivalue = int(value)
        if ivalue < min_value:
            raise argparse.ArgumentTypeError(f"Minimal value is: {min_value}")
        return ivalue

    return checker


def main():
    parser = argparse.ArgumentParser(
        description="Generate synthetic streaming datasets",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  generate 1000                                      # Generate 1000 records with random data
  generate 1000 --seed 42                            # Generate 1000 records with seed 42
        """,
    )
    parser.add_argument("num_records", type=min_int(100), help="Number of lines to be generated (>= 100)")
    parser.add_argument(
        "-o",
        "--output-dir",
        type=Path,
        default=Path("datasets"),
        help="Output directory for generated datasets",
    )
    parser.add_argument("--seed", type=int, help="Seed for reproducible generation (optional)")
    parser.add_argument(
        "--reference-date",
        type=lambda s: datetime.fromisoformat(s),
        help="Overwrite reference date for generation in ISO format (optional, e.g., 2026-02-08 or 2026-02-08T14:30:00)",
    )
    args = parser.parse_args()

    start_data_generation = time.time()

    config = GenerationConfig.create(seed=args.seed, reference_date=args.reference_date)
    config.log_config()

    spotify(args.num_records, args.output_dir, config)
    print("--- %s seconds ---" % (time.time() - start_data_generation))


if __name__ == "__main__":
    main()
