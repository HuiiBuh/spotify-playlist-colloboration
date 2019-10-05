import json
import os

from pyfy import Spotify


def get_settings():

    path = "./settings/settings_production.json"
    if not os.path.isfile(path):
        return None

    with open(path, "r", encoding="UTF-8") as settings_file:
        contend = settings_file.read()

    try:
        return_contend = json.loads(contend)
    except json.decoder.JSONDecodeError:
        return_contend = None

    return return_contend


def add_tracks(id_list: str):
    settings = get_settings()

    auth_token = settings["OAuth-Token"]
    playlist_id = settings["playlist-id"]
    sp = Spotify(auth_token)

    id_list = id_list[1:id_list.__len__() - 1]
    id_list = id_list.split(",")

    sp.add_playlist_tracks(playlist_id=playlist_id, track_ids=id_list)
