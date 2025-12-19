from datetime import datetime

from synthetic_datasets.factories.deezer import DeezerFactory


def test_deezer_factory_creates_catalog():
    """Test that factory creates a valid music catalog"""
    factory = DeezerFactory(num_records=100)

    assert len(factory.tracks) > 0
    assert all(hasattr(track, "song_title") for track in factory.tracks)
    assert all(hasattr(track, "artist") for track in factory.tracks)
    assert all(hasattr(track, "isrc") for track in factory.tracks)
    assert all(hasattr(track, "album_title") for track in factory.tracks)


def test_deezer_factory_creates_listening_history():
    """Test that factory creates valid listening history records"""
    factory = DeezerFactory(num_records=100)
    records = factory.create_listening_history()

    assert len(records) == 100

    # Test first record has all required fields
    record = records[0]
    assert hasattr(record, "song_title")
    assert hasattr(record, "artist")
    assert hasattr(record, "isrc")
    assert hasattr(record, "album_title")
    assert hasattr(record, "ip_address")
    assert hasattr(record, "listening_time")
    assert hasattr(record, "platform_name")
    assert hasattr(record, "date")


def test_listening_history_record_validation():
    """Test listening history record field validations"""
    factory = DeezerFactory(num_records=100)
    records = factory.create_listening_history()

    for record in records:
        # ISRC should be 12 characters (2 country + 3 registrant + 2 year + 5 designation)
        assert len(record.isrc) == 12
        assert record.isrc[:2].isupper()  # Country code

        # Listening time should be non-negative
        assert record.listening_time >= 0

        # Platform name should be valid
        assert record.platform_name in ["web", "android", "ios", "windows", "macos"]

        # Date should be a datetime
        assert isinstance(record.date, datetime)


def test_isrc_format():
    """Test ISRC code generation format"""
    factory = DeezerFactory(num_records=100)

    # Generate multiple ISRCs and check format
    for _ in range(50):
        isrc = factory._generate_isrc()
        # ISRC format: CC-XXX-YY-NNNNN (without dashes in the generated version)
        assert len(isrc) == 12
        assert isrc[:2].isupper()  # Country code
        assert isrc[2:5].isalnum()  # Registrant code
        assert isrc[5:7].isdigit()  # Year
        assert isrc[7:12].isdigit()  # Designation code


def test_date_serialization():
    """Test that date serializes to YYYY-MM-DD HH:MM:SS format"""
    factory = DeezerFactory(num_records=100)
    records = factory.create_listening_history()

    for record in records:
        serialized_date = record.serialize_date(record.date)
        # Should be "YYYY-MM-DD HH:MM:SS" format (19 characters)
        assert len(serialized_date) == 19
        assert serialized_date[4] == "-"
        assert serialized_date[7] == "-"
        assert serialized_date[10] == " "
        assert serialized_date[13] == ":"
        assert serialized_date[16] == ":"

        # Should be parseable back to a datetime
        datetime.strptime(serialized_date, "%Y-%m-%d %H:%M:%S")


def test_ip_serialization():
    """Test that IP address serializes correctly"""
    factory = DeezerFactory(num_records=100)
    records = factory.create_listening_history()

    for record in records:
        serialized_ip = record.serialize_ip(record.ip_address)
        # Should be a valid IP string
        parts = serialized_ip.split(".")
        assert len(parts) == 4
        assert all(part.isdigit() and 0 <= int(part) <= 255 for part in parts)
