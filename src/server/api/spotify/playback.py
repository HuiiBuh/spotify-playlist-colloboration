from flask import request, abort
from flask_login import login_required

from server import spotify
from server.api.api_functions import get_token_by_spotify_user_id
from server.api.routes import mod
from server.spotify import SpotifyAuthorisationToken


@mod.route("/queue-songs", methods=['PUT'])
@login_required
def queue_songs():
    """
    Queue songs to a specific user
    :return:
    """

    # ToDo make secure

    json = request.get_json()

    if "songs" not in json:
        return abort(400, "No songs where passed")

    if "spotify_user_id" not in json:
        return abort(400, "No spotify user id was passed")

    auth_token: SpotifyAuthorisationToken = get_token_by_spotify_user_id(json["spotify_user_id"])

    songs = json["songs"]
    queue_return_value = spotify.queue(track_id_list=songs, auth_token=auth_token)

    if "error" in queue_return_value:
        return abort(400, queue_return_value)
    return queue_return_value


@mod.route("/me/player/devices", methods=['GET'])
@login_required
def devices():
    """
    View the devices of a person
    :return: The devices
    """

    return spotify.devices()
