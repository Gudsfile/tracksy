from time import sleep

import pytest

from synthetic_datasets.factories.spotify import SpotifyFactory


def test_same_seed_produces_identical_results():
    """Test that same seed produces identical streaming records."""
    # given
    seed = 42
    num_records = 100

    # when two datasets are generated with the same seed but at different times
    factory1 = SpotifyFactory(num_records, seed=seed)
    streamings1 = factory1.create_streaming_history()

    sleep(1)

    factory2 = SpotifyFactory(num_records, seed=seed)
    streamings2 = factory2.create_streaming_history()

    # then the result should be exactly the same
    assert len(streamings1) == len(streamings2)
    assert streamings1 == streamings2
    for stream1, stream2 in zip(streamings1, streamings2):
        assert stream1.ts == stream2.ts
        assert stream1.platform == stream2.platform
        assert stream1.ms_played == stream2.ms_played
        assert stream1.conn_country == stream2.conn_country
        assert stream1.ip_addr == stream2.ip_addr
        assert stream1.master_metadata_track_name == stream2.master_metadata_track_name
        assert stream1.master_metadata_album_artist_name == stream2.master_metadata_album_artist_name
        assert stream1.master_metadata_album_album_name == stream2.master_metadata_album_album_name
        assert stream1.spotify_track_uri == stream2.spotify_track_uri
        assert stream1.reason_start == stream2.reason_start
        assert stream1.reason_end == stream2.reason_end
        assert stream1.shuffle == stream2.shuffle
        assert stream1.skipped == stream2.skipped
        assert stream1.offline == stream2.offline
        assert stream1.offline_timestamp == stream2.offline_timestamp
        assert stream1.incognito_mode == stream2.incognito_mode


def test_different_seeds_produce_different_results():
    """Test that different seeds produce different streaming records."""
    # given
    seed1 = 42
    seed2 = 123
    num_records = 50

    # when two datasets are generated with different seeds
    factory1 = SpotifyFactory(num_records, seed=seed1)
    streamings1 = factory1.create_streaming_history()

    factory2 = SpotifyFactory(num_records, seed=seed2)
    streamings2 = factory2.create_streaming_history()

    # then the results should be different
    assert len(streamings1) == len(streamings2)
    assert streamings1 != streamings2


def test_no_seed_produces_different_results_on_multiple_runs():
    """Test that without seed, multiple runs produce different results."""
    # given
    num_records = 50

    # when datasets are generated without seed
    factory1 = SpotifyFactory(num_records)
    streamings1 = factory1.create_streaming_history()

    factory2 = SpotifyFactory(num_records)
    streamings2 = factory2.create_streaming_history()

    # then the results should be different
    # Note: there's a tiny probability they could be the same
    assert len(streamings1) == len(streamings2)
    assert streamings1 != streamings2


def test_seed_affects_catalog_generation():
    """Test that seed affects the generated music catalog."""
    # given
    seed = 99
    num_records = 100

    # when two factories are generated with the same seed
    factory1 = SpotifyFactory(num_records, seed=seed)
    factory2 = SpotifyFactory(num_records, seed=seed)

    # then the tracks catalog should be identical
    assert len(factory1.tracks) == len(factory2.tracks)

    for track1, track2 in zip(factory1.tracks, factory2.tracks):
        assert track1.uri == track2.uri
        assert track1.name == track2.name
        assert track1.duration_ms == track2.duration_ms
        assert track1.album.name == track2.album.name
        assert track1.album.artist.name == track2.album.artist.name


@pytest.mark.parametrize("seed", [0, 1, 42, 999, 12345])
def test_various_seeds_work(seed):
    """Test that various seed values work correctly."""
    num_records = 100

    factory = SpotifyFactory(num_records, seed=seed)
    streamings = factory.create_streaming_history()

    assert len(streamings) == num_records
    assert all(stream.ts is not None for stream in streamings)
    assert all(stream.master_metadata_track_name for stream in streamings)
