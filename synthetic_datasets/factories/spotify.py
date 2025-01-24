import random
import string

from faker import Faker
from faker.providers import DynamicProvider

from ..models.spotify import DEFAULT_TRACK_ID_SIZE, DEFAULT_TRACK_URI_SUFFIX, Album, Artist, Streaming, Track, User
from .factory_config import FactoryConfig


def init_faker() -> Faker:
    fake = Faker()

    reason_start_provider = DynamicProvider(
        provider_name="reason_start",
        elements=[
            None,
            "appload",
            "clickrow",
            "click-row",
            "backbtn",
            "fwdbtn",
            "persisted",
            "playbtn",
            "remote",
            "trackdone",
            "trackerror",
            "unknown",
        ],
    )
    fake.add_provider(reason_start_provider)

    reason_end_provider = DynamicProvider(
        provider_name="reason_end",
        elements=[
            None,
            "backbtn",
            "clickrow",
            "click-row",
            "endplay",
            "fwdbtn",
            "logout",
            "playbtn",
            "remote",
            "trackdone",
            "trackerror",
            "unexpected-exit",
            "unexpected-exit-while-paused",
            "unknown",
        ],
    )
    fake.add_provider(reason_end_provider)
    return fake


def random_platforms(fake: Faker, nb_platforms: int) -> list[str]:
    return [
        fake.random_element(
            [
                fake.android_platform_token(),
                fake.ios_platform_token(),
                fake.linux_platform_token(),
                fake.mac_platform_token(),
                fake.windows_platform_token(),
            ]
        )
        for _ in range(0, nb_platforms)
    ]


def random_users(fake: Faker, nb_users: int, platforms: list[str], ratio_platform_by_user: int):
    return [
        User(
            name=fake.user_name(),
            platforms=random.choices(platforms, k=random.randint(1, ratio_platform_by_user)),
        )
        for _ in range(nb_users)
    ]


def random_artists(fake: Faker, nb_artists: int) -> list[Artist]:
    return [Artist(name=fake.name()) for _ in range(nb_artists)]


def random_albums(fake: Faker, nb_albums: int, artists) -> list[Album]:
    return [
        Album(name=fake.sentence(nb_words=3, variable_nb_words=True)[:-1], artist=random.choice(artists))
        for _ in range(0, nb_albums)
    ]


def random_tracks(fake: Faker, nb_tracks: int, albums) -> list[Track]:
    return [
        Track(
            uri=DEFAULT_TRACK_URI_SUFFIX
            + "".join(random.choices(string.ascii_lowercase + string.digits, k=DEFAULT_TRACK_ID_SIZE)),
            name=fake.sentence(nb_words=2, variable_nb_words=True)[:-1],
            album=random.choice(albums),
        )
        for _ in range(0, nb_tracks)
    ]


def random_streaming(fake: Faker, track: Track, user: User) -> Streaming:
    return Streaming(
        ts=fake.date_this_year(after_today=False),
        username=user.name,
        platform=random.choice(user.platforms),
        ms_played=random.randint(0, 720000),
        conn_country=fake.country_code(),
        ip_addr_decrypted=fake.ipv4(),
        user_agent_decrypted=fake.user_agent(),
        master_metadata_track_name=track.name,
        master_metadata_album_artist_name=track.album.artist.name,
        master_metadata_album_album_name=track.album.name,
        spotify_track_uri=track.uri,
        episode_name=None,
        episode_show_name=None,
        spotify_episode_uri=None,
        reason_start=fake.reason_start(),
        reason_end=fake.reason_end(),
        shuffle=bool(random.getrandbits(1)),
        skipped=bool(random.getrandbits(1)),
        offline=bool(random.getrandbits(1)),
        offline_timestamp=None,
        incognito_mode=False,
    )


def random_streamings(fake: Faker, nb_streams: int, users: list[User], tracks: list[Track]) -> list[Streaming]:
    return [random_streaming(fake, random.choice(tracks), random.choice(users)) for _ in range(0, nb_streams)]


def generate_streamings(fake: Faker, config: FactoryConfig) -> list[Streaming]:
    platforms = random_platforms(fake, config.nb_platforms)
    users = random_users(fake, config.nb_users, platforms, config.ratio_platform_by_user)
    artists = random_artists(fake, config.nb_artists)
    albums = random_albums(fake, config.nb_albums, artists)
    tracks = random_tracks(fake, config.nb_tracks, albums)
    return random_streamings(fake, config.nb_streams, users, tracks)
