import pyfy
from flask import Blueprint, jsonify, request, Response, redirect, abort
from flask_login import login_required
from pyfy import AuthError

from server import spotify_client, spotify, state, spotify_scopes
from server.api.api_functions import modify_playlist_json, modify_track_json, add_tracks, update_oauth, collect_tracks
from server.functions import get_settings

mod = Blueprint("api", __name__)


@mod.route("/authorize")
@login_required
def authorize():
    spotify_client.load_from_env()
    spotify.client_creds = spotify_client
    if spotify.is_oauth_ready:
        return redirect(spotify.auth_uri(state=state, scopes=spotify_scopes))
    else:
        return (jsonify(
            {"error": "Client needs client_id, client_secret and a redirect uri in order to handle OAauth properly"}
        ), 500)


@mod.route("/callback/")
@login_required
def callback():
    if request.args.get("error"):
        return jsonify(dict(error=request.args.get("error_description")))
    elif request.args.get("code"):
        grant = request.args.get("code")
        callback_state = request.args.get("state")

        if callback_state != state:
            return abort(401)

        try:
            user_creds = spotify.build_user_creds(grant=grant)
        except AuthError as e:
            return jsonify(dict(error_description=e.msg)), e.code

        return user_creds.__dict__
    else:
        return abort(500)


@mod.route("/spotify/playlist")
@login_required
def get_playlist():
    settings = get_settings()
    playlist_id = settings["playlist-id"]

    try:
        playlist = spotify.playlist(playlist_id=playlist_id)
    except pyfy.excs.ApiError:
        update_oauth()

        playlist = spotify.playlist(playlist_id=playlist_id)

    modified_playlist = modify_playlist_json(playlist)

    return modified_playlist


@mod.route("/spotify/playlist/tracks")
@login_required
def get_playlist_tracks():
    playlist_id = get_settings()["playlist-id"]

    modified_tracks = collect_tracks(playlist_id)

    return jsonify(modified_tracks)


@mod.route("/spotify/playlist/add", methods=['POST', 'GET'])
@login_required
def add_track_to_playlist():
    json = request.get_json()

    if "track-list" in json:
        add_tracks(json["track-list"])
        return Response(status=201)
    else:
        return Response(status=400)
