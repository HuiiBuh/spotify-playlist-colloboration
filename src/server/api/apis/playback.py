import json

from flask import request
from flask_login import login_required

from server import socket_io, db
from server import spotify
from server.api.api_functions import get_token_by_spotify_user_id, return_error
from server.api.apis.websockets import WSPlayback
from server.api.routes import mod
from server.main.modals import Queue, Song, SpotifyUser
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


@mod.route("/<spotify_user_id>/player/devices", methods=['GET'])
@login_required
def devices(spotify_user_id):
    """
    View the devices of a person
    :return: The devices
    """

    auth_token: SpotifyAuthorisationToken = get_token_by_spotify_user_id(spotify_user_id)
    if not auth_token:
        return "No user with this id in the database", 400

    try:
        return spotify.devices(auth_token)
    except SpotifyError as e:
        return return_error(e)


@mod.route("<spotify_user_id>/player", methods=["PUT", "GET"])
@login_required
def player(spotify_user_id):
    """
    Returns the player information from spotify
    :return: The playback
    """

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
        try:
            return spotify.current_playback(auth_token)
        except SpotifyError as e:
            return return_error(e)


@mod.route("<spotify_user_id>/player/pause ", methods=["PUT"])
@login_required
def pause(spotify_user_id):
    """
    Pauses the spotify playback
    :return:
    """

    auth_token: SpotifyAuthorisationToken = get_token_by_spotify_user_id(spotify_user_id)
    if not auth_token:
        return "No user with this id in the database", 400

    try:
        device = spotify.active_devices(auth_token)
    except SpotifyError as e:
        return return_error(e)

    if not device:
        return "You have to start the playback on one device to use this functionality", 400

    try:
        return spotify.pause(auth_token, device["id"])
    except SpotifyError as e:
        return return_error(e)


@mod.route("<spotify_user_id>/player/play ", methods=["PUT"])
@login_required
def play(spotify_user_id):
    """
    Continues the spotify playback
    :return:
    """

    auth_token: SpotifyAuthorisationToken = get_token_by_spotify_user_id(spotify_user_id)
    if not auth_token:
        return "No user with this id in the database", 400

    try:
        device = spotify.active_devices(auth_token)
    except SpotifyError as e:
        return return_error(e)

    if not device:
        return "You have to start the playback on one device to use this functionality", 400

    try:
        return spotify.play(auth_token, device["id"])
    except SpotifyError as e:
        return return_error(e)


@mod.route("<spotify_user_id>/player/next ", methods=["POST"])
@login_required
def next(spotify_user_id):
    """
    Go to the next track
    :return:
    """

    auth_token: SpotifyAuthorisationToken = get_token_by_spotify_user_id(spotify_user_id)
    if not auth_token:
        return "No user with this id in the database", 400

    try:
        return spotify.next(auth_token)
    except SpotifyError as e:
        return return_error(e)


@mod.route("<spotify_user_id>/player/previous ", methods=["POST"])
@login_required
def previous(spotify_user_id):
    """
    Go to the previous track
    :return:
    """

    auth_token: SpotifyAuthorisationToken = get_token_by_spotify_user_id(spotify_user_id)
    if not auth_token:
        return "No user with this id in the database", 400

    try:
        return spotify.previous(auth_token)
    except SpotifyError as e:
        return return_error(e)


@mod.route("<spotify_user_id>/player/queue", methods=["POST"])
@login_required
def add_song_to_queue(spotify_user_id):
    """
    Add a track to the queue
    :param spotify_user_id: The spotify user id
    :return: Success or error message
    """

    auth_token: SpotifyAuthorisationToken = get_token_by_spotify_user_id(spotify_user_id)
    if not auth_token:
        return "No spotify user with this id present", 404

    track_id = request.args.get("track-id")
    try:
        song_info = json.dumps(spotify.track(track_id=track_id, auth_token=auth_token))
    except SpotifyError as e:
        return return_error(e)

    spotify_user_db_id = SpotifyUser.query.filter(SpotifyUser.spotify_user_id == spotify_user_id).first().id
    queue = Queue.query.filter(Queue.spotify_user_db_id == spotify_user_db_id).first()
    if not queue:
        return "The queue does not exist", 404

    if Song.query.filter(Song.spotify_id == track_id and Song.queue_id == queue.id and Song.playing is None).all():
        return "The song is already in the queue", 403

    song = Song(spotify_id=track_id, song_info=song_info, queue_id=queue.id)
    db.session.add(song)
    db.session.commit()

    return "Added track to queue"


socket_io.on_namespace(WSPlayback('/api/playback'))
socket_io.on_namespace(WSPlayback('/api/queue'))
