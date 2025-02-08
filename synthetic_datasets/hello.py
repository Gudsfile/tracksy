import sys
import time
from pathlib import Path

from tqdm import tqdm

from .factories.factory_config import FactoryConfig
from .factories.spotify import generate_streamings, init_faker
from .writers.spotify import DEFAULT_EXTENSION, DEFAULT_FOLDER, DEFAULT_PREFIX, write, write_zip


def spotify(nb_streams):
    def generator(nb_streams):
        yield generate_streamings(
            init_faker(),
            FactoryConfig(
                nb_streams=nb_streams,
                nb_users=2,
                nb_tracks=int(nb_streams * 0.5),
                nb_albums=int(nb_streams * 0.3),
                nb_artists=int(nb_streams * 0.2),
            ),
        )

    print(f"Generating one file of {nb_streams} lines")
    write(
        next(generator(nb_streams)),
        Path(f"datasets/{DEFAULT_FOLDER}/{DEFAULT_PREFIX}_2024-2025_{nb_streams}{DEFAULT_EXTENSION}"),
    )

    chunk_size = 20000
    minimum_nb_file = 4
    nb_file_to_write = max(int(nb_streams / chunk_size), minimum_nb_file)
    print(f"Generating {nb_file_to_write} files to be zipped")
    write_zip(
        [next(generator(int(nb_streams / nb_file_to_write))) for _ in tqdm(range(0, nb_file_to_write))],
        Path(f"datasets/{DEFAULT_FOLDER}/"),
    )


def main():
    args = sys.argv[1:]
    if len(args) < 1 or len(args) > 1:
        print(f"One and only one argument is required to set the number of lines to be generated. Given args: {args}")
        sys.exit(1)
    if not args[0].isdigit():
        print(f"Number of lines to be generated should be integer. Given arg: {args[0]}")
        sys.exit(1)
    start_data_generation = time.time()
    spotify(int(args[0]))
    print("--- %s seconds ---" % (time.time() - start_data_generation))


if __name__ == "__main__":
    main()
