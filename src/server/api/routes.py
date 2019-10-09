from flask import Blueprint, jsonify, request, Response

from server.api.api_functions import modify_playlist_json, modify_track_json, add_tracks
from server.functions import get_settings

mod = Blueprint("api", __name__)


@mod.route("/spotify/playlist")
def get_playlist():
    settings = get_settings()
    playlist_id = settings["playlist-id"]

    playlist = spotify.playlist(playlist_id=playlist_id)

    modified_playlist = modify_playlist_json(playlist)

    return modified_playlist


@mod.route("/spotify/playlist/tracks")
def get_playlist_tracks():
    settings = get_settings()

    auth_token = settings["OAuth-Token"]
    playlist_id = settings["playlist-id"]

    tracks = spotify.playlist_tracks(playlist_id=playlist_id)

    modified_tracks = modify_track_json(tracks)

    return jsonify(modified_tracks)


# curl -d '{"track-list":"[2c5Isyd07hWsl7AQia2Dig,5a3rLTbh7L7lBj5cflW3sf]"}' -H "Content-Type: application/json" -X POST http://127.0.0.1:5000/api/v1/spotify/playlist/add
@mod.route("/spotify/playlist/add", methods=['POST', 'GET'])
def add_track_to_playlist():
    json = request.get_json()

    if "track-list" in json:
        add_tracks(json["track-list"])
        return Response(status=201)
    else:
        return Response(status=400)
