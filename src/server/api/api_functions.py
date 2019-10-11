import pyfy

from server import spotify_client, spotify
from server.functions import get_settings


def collect_tracks(playlist_id, count=0, offset=0, modified_tracks=None):
    if modified_tracks is None:
        modified_tracks = {}
    try:
        tracks = spotify.playlist_tracks(playlist_id=playlist_id, offset=offset)
    except pyfy.excs.ApiError:
        update_oauth()
        tracks = spotify.playlist_tracks(playlist_id=playlist_id, offset=offset)

    count += len(tracks["items"])

    modified_tracks = modify_track_json(tracks, return_track_list=modified_tracks)

    if tracks["total"] > count:
        collect_tracks(playlist_id, count=count, offset=(count - 1), modified_tracks=modified_tracks)

    return modified_tracks


def modify_track_json(track_list, return_track_list=None):
    if return_track_list is None:
        return_track_list = {}
    track_list = track_list["items"]

    for track in track_list:
        track = track["track"]
        return_track_list[track["id"]] = {}
        return_track_list[track["id"]]["title"] = track["name"]
        return_track_list[track["id"]]["album"] = {}
        return_track_list[track["id"]]["album"]["name"] = track["album"]["name"]
        return_track_list[track["id"]]["album"]["url"] = track["album"]["external_urls"]["spotify"]
        return_track_list[track["id"]]["cover"] = track["album"]["images"][1]["url"]
        return_track_list[track["id"]]["url"] = track["external_urls"]["spotify"]
        return_track_list[track["id"]]["duration"] = track["duration_ms"]
        artist_list = track["artists"]
        return_track_list[track["id"]]["artists"] = []

        for artist in artist_list:
            artist_json = {
                "name": artist["name"],
                "url": artist["external_urls"]["spotify"]
            }

            return_track_list[track["id"]]["artists"].append(artist_json)

    return return_track_list


def modify_playlist_json(playlist_json):
    return_playlist = {
        "name": playlist_json["name"],
        "author": {
            "name": playlist_json["owner"]["display_name"],
            "url": playlist_json["owner"]["external_urls"]["spotify"]
        },
        "url": playlist_json["external_urls"]["spotify"],
        "image_url": playlist_json["images"][0]["url"],
        "track_count": playlist_json["tracks"]["total"]
    }

    return return_playlist


def add_tracks(id_list: str):
    playlist_id = get_settings()["playlist-id"]

    id_list = id_list[1:id_list.__len__() - 1]
    id_list = id_list.split(",")

    try:
        spotify_client.add_playlist_tracks(playlist_id=playlist_id, track_ids=id_list)
    except pyfy.excs.ApiError:
        update_oauth()
        spotify_client.add_playlist_tracks(playlist_id=playlist_id, track_ids=id_list)


def update_oauth():
    spotify_client.load_from_env()
    spotify.client_creds = spotify_client
    spotify.authorize_client_creds(client_creds=spotify_client)
