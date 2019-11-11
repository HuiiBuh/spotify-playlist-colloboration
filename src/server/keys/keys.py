import os


class KEYS:
    SPOTIFY_CLIENT_ID = os.environ["SPOTIFY_CLIENT_ID"]
    SPOTIFY_CLIENT_SECRET = os.environ["SPOTIFY_CLIENT_SECRET"]
    SPOTIFY_REDIRECT_URI = os.environ["SPOTIFY_REDIRECT_URI"]
    SPOTIFY_STATE = os.environ["SPOTIFY_STATE"]
    SPOTIFY_SCOPES = [
        "playlist-modify-private",
        "playlist-modify-public",
        "user-read-email",
        "user-read-private"
    ]

    DATABASE_USERNAME = os.environ["DATABASE_USERNAME"]
    DATABASE_PASSWORD = os.environ["DATABASE_PASSWORD"]

    DATABASE_IP = os.environ["DATABASE_IP"]

    DEFAULT_USER = os.environ["DEFAULT_USER"]
    DEFAULT_USER_PASSWORD = os.environ["DEFAULT_USER_PASSWORD"]
