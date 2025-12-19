import argparse
import time
from pathlib import Path

from synthetic_datasets.factories.applemusic import AppleMusicFactory
from synthetic_datasets.factories.deezer import DeezerFactory
from synthetic_datasets.factories.spotify import SpotifyFactory
from synthetic_datasets.writers.applemusic import AppleMusicWriter
from synthetic_datasets.writers.deezer import DeezerWriter
from synthetic_datasets.writers.spotify import SpotifyWriter


def spotify(num_records, output_dir):
    factory = SpotifyFactory(num_records)
    all_streamings = factory.create_streaming_history()

    writer = SpotifyWriter(output_dir=output_dir)
    writer.write(all_streamings)


def applemusic(num_records, output_dir):
    factory = AppleMusicFactory(num_records)
    all_plays = factory.create_play_history()

    writer = AppleMusicWriter(output_dir=output_dir)
    writer.write(all_plays)


def deezer(num_records, output_dir):
    factory = DeezerFactory(num_records)
    all_listens = factory.create_listening_history()

    writer = DeezerWriter(output_dir=output_dir)
    writer.write(all_listens)


def min_int(min_value):
    def checker(value):
        ivalue = int(value)
        if ivalue < min_value:
            raise argparse.ArgumentTypeError(f"Minimal value is: {min_value}")
        return ivalue

    return checker


def main():
    parser = argparse.ArgumentParser(formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    parser.add_argument("num_records", type=min_int(100), help="Number of lines to be generated (>= 100)")
    parser.add_argument(
        "provider",
        nargs="?",
        choices=["spotify", "applemusic", "deezer", "all"],
        default="all",
        help="Provider to generate data for",
    )
    parser.add_argument("-o", "--output-dir", type=Path, default=Path("datasets"))
    args = parser.parse_args()

    start_data_generation = time.time()

    if args.provider in ["spotify", "all"]:
        print("\n🎵 Generating Spotify data...")
        spotify(args.num_records, args.output_dir)

    if args.provider in ["applemusic", "all"]:
        print("\n🍎 Generating Apple Music data...")
        applemusic(args.num_records, args.output_dir)

    if args.provider in ["deezer", "all"]:
        print("\n🔟 Generating Deezer data...")
        deezer(args.num_records, args.output_dir)

    print("\n✅ Generation complete!")
    print("--- %s seconds ---" % (time.time() - start_data_generation))


if __name__ == "__main__":
    main()
