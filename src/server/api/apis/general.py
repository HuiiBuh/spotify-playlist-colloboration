from flask import jsonify, request, Response
from flask_login import login_required

from server import spotify
from server.api.routes import mod
from server.api.api_functions import update_spotify_user, get_token_by_playlist, get_token_by_spotify_user_id, \
    modify_playlist_json, collect_tracks, check_songs, modify_track_json, return_error
from server.spotify.spotify import SpotifyError


@mod.route("/spotify/search", methods=["GET"])
# @login_required
# TODO
def search():
    """
    Search for songs and artists
    You have to pass a playlist or user id so the server is able to get the right auth token
    :return: The search results as json
    """

    playlist_id = request.args.get('playlist-id')
    user_id = request.args.get('spotify-user-id')

    if not playlist_id and not user_id:
        return "You did not give a playlist-id or spotify-user-id", 400

    auth_token = None
    if playlist_id:
        auth_token = get_token_by_playlist(playlist_id)
    if user_id:
        auth_token = get_token_by_spotify_user_id(user_id)

    if not auth_token:
        return "No playlist or user with this id found", 400

    # Check if expired and update the user
    if auth_token.is_expired():
        auth_token = spotify.reauthorize(auth_token)
        user_id = spotify.me(auth_token)["id"]
        update_spotify_user(user_id, auth_token)

    search_term = request.args.get('q')

    if search_term is None or search_term == "":
        return "Empty string as search", 400

    try:
        search_results = spotify.search(search_term, "track", auth_token, limit=10)
    except SpotifyError as e:
        return return_error(e)

    return_search_results = modify_track_json(search_results["tracks"])
    return return_search_results


@mod.route("/spotify/playlists/<playlist_id>", methods=["GET"])
@login_required
def get_playlist(playlist_id):
    """
    Get a playlist
    :return: The json of the playlist
    """

    auth_token = get_token_by_playlist(playlist_id)

    if not auth_token:
        return "No playlist with this id found", 400

    # Check if expired and update the user
    if auth_token.is_expired():
        auth_token = spotify.reauthorize(auth_token)
        user_id = spotify.me(auth_token)["id"]
        update_spotify_user(user_id, auth_token)
    try:
        playlist = spotify.playlist(playlist_id=playlist_id, auth_token=auth_token)
    except SpotifyError as e:
        return return_error(e)

    modified_playlist = modify_playlist_json(playlist)

    return modified_playlist


@mod.route("/spotify/playlist/<playlist_id>/tracks", methods=["GET"])
@login_required
def get_playlist_tracks(playlist_id):
    """
    Get the tracks of a playlist
    :return: The tracks of the playlist as json
    """

    auth_token = get_token_by_playlist(playlist_id)

    if not auth_token:
        return "No playlist with this id found", 400

    # Check if expired and update the user
    if auth_token.is_expired():
        auth_token = spotify.reauthorize(auth_token)
        user_id = spotify.me(auth_token)["id"]
        update_spotify_user(user_id, auth_token)

    modified_tracks = collect_tracks(playlist_id, auth_token)

    return jsonify(modified_tracks)


@mod.route("/spotify/playlist/<playlist_id>/tracks", methods=['POST', "GET"])
@login_required
def add_track_to_playlist(playlist_id):
    """
    POST: Add tracks to the playlist
    GET: Get the tracks from the playlist
    :return: status 201, or 400
    """

    auth_token = get_token_by_playlist(playlist_id)

    if not auth_token:
        return "No playlist with this id found", 400

    # Check if expired and update the user
    if auth_token.is_expired():
        auth_token = spotify.reauthorize(auth_token)
        user_id = spotify.me(auth_token)["id"]
        update_spotify_user(user_id, auth_token)

    if request.method == "POST":

        json = request.get_json()

        if "track-list" in json:
            track_list = json["track-list"]
        else:
            return "Your request body has not track-list", 400

        track_list = check_songs(track_list, auth_token, playlist_id)

        if not track_list:
            return "You passed an empty message", 400

        spotify.add_playlist_tracks(playlist_id, track_list, auth_token)
        return Response(status=201)
    else:
        modified_tracks = collect_tracks(playlist_id, auth_token)
        return jsonify(modified_tracks)


@mod.route("/spotify/me")
@login_required
def me():
    """
    Get information about the auth token for the playlist
    :return: Information about the playlist spotify user
    """

    playlist_id = request.args.get('playlist-id')

    if not playlist_id:
        return 400, "You did not give a playlist-id", 400

    auth_token = get_token_by_playlist(playlist_id)

    if not auth_token:
        return 400, "No playlist with this id found", 400

    # Check if expired and update the user
    if auth_token.is_expired():
        auth_token = spotify.reauthorize(auth_token)
        user_id = spotify.me(auth_token)["id"]
        update_spotify_user(user_id, auth_token)

    return spotify.me(auth_token=auth_token)
