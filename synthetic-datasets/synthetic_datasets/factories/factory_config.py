from pydantic import BaseModel

DEFAULT_NB_PLATFORMS = 5


class FactoryConfig(BaseModel):
    nb_streams: int
    nb_tracks: int
    nb_albums: int
    nb_artists: int
    nb_platforms: int = DEFAULT_NB_PLATFORMS
