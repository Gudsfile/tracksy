from datetime import datetime

from synthetic_datasets.factories.applemusic import AppleMusicFactory
from synthetic_datasets.models.applemusic import EndReasonTypeEnum, SourceTypeEnum


def test_applemusic_factory_creates_catalog():
    """Test that factory creates a valid music catalog"""
    factory = AppleMusicFactory(num_records=100)

    assert len(factory.tracks) > 0
    assert all(hasattr(track, "track_id") for track in factory.tracks)
    assert all(hasattr(track, "name") for track in factory.tracks)
    assert all(hasattr(track, "artist") for track in factory.tracks)
    assert all(hasattr(track, "duration_ms") for track in factory.tracks)


def test_applemusic_factory_creates_play_history():
    """Test that factory creates valid play history records"""
    factory = AppleMusicFactory(num_records=100)
    records = factory.create_play_history()

    assert len(records) == 100

    # Test first record has all required fields
    record = records[0]
    assert hasattr(record, "country")
    assert hasattr(record, "track_identifier")
    assert hasattr(record, "date_played")
    assert hasattr(record, "hours")
    assert hasattr(record, "play_duration_milliseconds")
    assert hasattr(record, "end_reason_type")
    assert hasattr(record, "source_type")


def test_play_history_record_validation():
    """Test play history record field validations"""
    factory = AppleMusicFactory(num_records=100)
    records = factory.create_play_history()

    for record in records:
        # Country should be 2-letter code
        assert len(record.country) == 2
        assert record.country.isupper()

        # Hours should be 0-23
        assert 0 <= record.hours <= 23

        # Play duration should be positive
        assert record.play_duration_milliseconds >= 0

        # End reason should be valid enum
        assert isinstance(record.end_reason_type, EndReasonTypeEnum)

        # Source type should be valid enum
        assert isinstance(record.source_type, SourceTypeEnum)

        # Play count and skip count should be non-negative
        assert record.play_count >= 0
        assert record.skip_count >= 0

        # Either played or skipped, not both
        assert (record.play_count == 1 and record.skip_count == 0) or (
            record.play_count == 0 and record.skip_count == 1
        )


def test_date_played_serialization():
    """Test that date_played serializes to YYYYMMDD format"""
    factory = AppleMusicFactory(num_records=100)
    records = factory.create_play_history()

    for record in records:
        serialized_date = record.serialize_date_played(record.date_played)
        # Should be 8 digits (YYYYMMDD)
        assert len(serialized_date) == 8
        assert serialized_date.isdigit()

        # Should be parseable back to a date
        datetime.strptime(serialized_date, "%Y%m%d")


def test_track_description_format():
    """Test track description format matches expected pattern"""
    factory = AppleMusicFactory(num_records=100)
    records = factory.create_play_history()

    for record in records:
        if record.track_identifier is not None and record.track_identifier != 0:
            # Should be "Artist - Track Name" format
            assert " - " in record.track_description
            assert record.track_description != "N/A"
        else:
            # Unknown tracks should have N/A description
            assert record.track_description == "N/A"
