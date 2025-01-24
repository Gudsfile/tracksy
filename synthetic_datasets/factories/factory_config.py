from pydantic import BaseModel

DEFAULT_NB_PLATFORMS = 100
DEFAULT_RATIO_PLATFORM_BY_USER = 5


class FactoryConfig(BaseModel):
    nb_streams: int
    nb_users: int
    nb_tracks: int
    nb_albums: int
    nb_artists: int
    nb_platforms: int = DEFAULT_NB_PLATFORMS
    ratio_platform_by_user: int = DEFAULT_RATIO_PLATFORM_BY_USER
