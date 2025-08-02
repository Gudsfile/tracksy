import argparse
import time
from pathlib import Path

from synthetic_datasets.factories.spotify import SpotifyFactory
from synthetic_datasets.writers.spotify import SpotifyWriter


def spotify(num_records, output_dir):
    factory = SpotifyFactory(num_records)
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
    parser = argparse.ArgumentParser()
    parser.add_argument("num_records", type=min_int(100), help="Number of lines to be generated (>= 100)")
    parser.add_argument("-o", "--output-dir", type=Path, default=Path("datasets"))
    args = parser.parse_args()

    start_data_generation = time.time()
    spotify(args.num_records, args.output_dir)
    print("--- %s seconds ---" % (time.time() - start_data_generation))


if __name__ == "__main__":
    main()
