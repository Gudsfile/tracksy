from dataclasses import replace

import pytest

from synthetic_datasets.factories.spotify import SpotifyFactory


def test_same_seed_produces_identical_results(default_generation_config):
    """Test that same seed produces identical streaming records."""
    # given
    num_records = 100

    # when two datasets are generated with the same seed
    factory1 = SpotifyFactory(num_records, default_generation_config)
    streamings1 = factory1.create_streaming_history()

    factory2 = SpotifyFactory(num_records, default_generation_config)
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


def test_different_seeds_produce_different_results(default_generation_config):
    """Test that different seeds produce different streaming records."""
    # given different seeds
    num_records = 50
    config1 = replace(default_generation_config, seed=123)
    config2 = replace(default_generation_config, seed=456)

    # when datasets are generated
    factory1 = SpotifyFactory(num_records, config1)
    streamings1 = factory1.create_streaming_history()

    factory2 = SpotifyFactory(num_records, config2)
    streamings2 = factory2.create_streaming_history()

    # then the results should be different
    assert len(streamings1) == len(streamings2)
    assert streamings1 != streamings2


@pytest.mark.parametrize("seed", [0, 1, 42, 999, 12345])
def test_various_seeds_work(seed, default_generation_config):
    """Test that various seed values work correctly."""
    num_records = 100
    config = replace(default_generation_config, seed=seed)

    factory = SpotifyFactory(num_records, config)
    streamings = factory.create_streaming_history()

    assert len(streamings) == num_records
