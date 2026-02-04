import argparse
import time
from pathlib import Path

from synthetic_datasets.factories.spotify import SpotifyFactory
from synthetic_datasets.writers.spotify import SpotifyWriter


def spotify(num_records: int, output_dir: Path, seed: int | None):
    factory = SpotifyFactory(num_records, seed=seed)
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
  generate 1000                    # Generate 1000 records with random data
  generate 1000 --seed 42          # Generate 1000 records with seed 42 (reproducible)
  generate 1000 --seed 42 -o test  # Same but output to 'test' directory
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
    args = parser.parse_args()

    start_data_generation = time.time()
    spotify(args.num_records, args.output_dir, args.seed)
    if args.seed is not None:
        print(f"🌱 Reproducible generation with seed: {args.seed}")
    print("--- %s seconds ---" % (time.time() - start_data_generation))


if __name__ == "__main__":
    main()
