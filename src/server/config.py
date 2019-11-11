import os

from server.keys import KEYS

base_dir = os.path.abspath(os.path.dirname(__file__))


class Config(object):
    SECRET_KEY = "HuiBuh"
    SQLALCHEMY_DATABASE_URI = f"mysql://{KEYS.DATABASE_USERNAME}:{KEYS.DATABASE_PASSWORD}@{KEYS.DATABASE_IP}/spotify_playlist"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
