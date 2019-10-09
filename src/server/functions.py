import json
import os

from pyfy import Spotify


def get_settings(path="./server/settings/settings_production.json"):
    if not os.path.isfile(path):
        return None

    with open(path, "r", encoding="UTF-8") as settings_file:
        contend = settings_file.read()

    try:
        return_contend = json.loads(contend)
    except json.decoder.JSONDecodeError:
        return_contend = None

    return return_contend


def modify_json(track_list):
    track_list = track_list["items"]

    return_track_list = {}

    for track in track_list:
        track = track["track"]
        return_track_list[track["id"]] = {}
        return_track_list[track["id"]]["title"] = track["name"]
        return_track_list[track["id"]]["album"] = track["album"]["name"]
        return_track_list[track["id"]]["image_url"] = track["album"]["images"][1]["url"]
        duration: int = track["duration_ms"]

        seconds = str(int((duration / 1000) % 60)).zfill(2)
        minutes = str(int((duration / (1000 * 60)) % 60)).zfill(2)
        hours = str(int((duration / (1000 * 60 * 60)) % 60))
        return_duration = ""

        if hours != "0":
            return_duration += hours + ":"

        if hours != "0" or minutes != "0":
            return_duration += minutes + ":"

        return_duration += seconds

        return_track_list[track["id"]]["duration"] = return_duration

        artist_list = track["artists"]
        return_track_list[track["id"]]["artists"] = {}

        for artist in artist_list:
            return_track_list[track["id"]]["artists"][artist["id"]] = artist["name"]

    return return_track_list


def add_tracks(id_list: str):
    settings = get_settings()

    auth_token = settings["OAuth-Token"]
    playlist_id = settings["playlist-id"]
    sp = Spotify(auth_token)

    id_list = id_list[1:id_list.__len__() - 1]
    id_list = id_list.split(",")

    sp.add_playlist_tracks(playlist_id=playlist_id, track_ids=id_list)
