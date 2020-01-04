from flask import request
from flask_login import login_required

from server import spotify
from server.api.api_functions import get_token_by_spotify_user_id, return_error
from server.api.routes import mod
from server.spotify import SpotifyAuthorisationToken

# ToDo make secure
from server.spotify.spotify import SpotifyError


@mod.route("/queue-songs", methods=['PUT'])
@login_required
def queue_songs():
    """
    Queue songs to a specific user
    :return: ""
    """

    json = request.get_json()

    if "songs" not in json:
        return "No songs where passed", 400

    if "spotify_user_id" not in json:
        return "No spotify user id was passed", 400

    auth_token: SpotifyAuthorisationToken = get_token_by_spotify_user_id(json["spotify_user_id"])

    songs = json["songs"]
    queue_return_value = spotify.queue(track_id_list=songs, auth_token=auth_token)

    if "error" in queue_return_value:
        return queue_return_value, 400
    return queue_return_value


@mod.route("/me/player/devices", methods=['GET'])
@login_required
def devices():
    """
    View the devices of a person
    :return: The devices
    """

    spotify_user_id = request.args.get("spotify-user-id")
    if not spotify_user_id:
        return "You did not provide a spotify user id", 400

    auth_token: SpotifyAuthorisationToken = get_token_by_spotify_user_id(spotify_user_id)
    if not auth_token:
        return "No user with this id in the database", 400

    try:
        return spotify.devices(auth_token)
    except SpotifyError as e:
        return return_error(e)


@mod.route("me/player", methods=["PUT", "GET"])
@login_required
def player():
    """
    Returns the player information from spotify
    :return: The playback
    """

    spotify_user_id = request.args.get("spotify-user-id")
    if not spotify_user_id:
        return "You did not provide a spotify user id", 400

    auth_token: SpotifyAuthorisationToken = get_token_by_spotify_user_id(spotify_user_id)
    if not auth_token:
        return "No user with this id in the database", 400

    if request.method == "PUT":
        json = request.get_json()
        if not json or json and "device_id" not in json:
            return "No device id passed", 400

        device_id = json["device_id"]
        try:
            return spotify.switch_device(auth_token, device_id)
        except SpotifyError as e:
            return return_error(e)

    if request.method == "GET":
        return spotify.current_playback(auth_token)
