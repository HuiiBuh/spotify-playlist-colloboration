from flask import Blueprint, jsonify, request, Response, redirect, abort
from flask_login import login_required

from server import spotify, spotify_info
from server.spotify import SpotifyAuthorisationToken
from server.api.api_functions import modify_playlist_json, modify_track_json, add_tracks, \
    collect_tracks
from server.functions import get_settings

mod = Blueprint("api", __name__)


@mod.route("/authorize")
@login_required
def authorize():
    url = spotify.build_authorize_url(show_dialog=False)
    return redirect(url)


@mod.route("/callback/")
@login_required
def callback():
    if request.args.get("error"):
        return jsonify(dict(error=request.args.get("error_description")))
    else:
        callback_state = request.args.get("state")

        if callback_state != spotify_info.state:
            return f"The state was not the same." \
                   f"The returned state was {callback_state}"

    auth_code: str = request.args.get("code")
    auth_token: SpotifyAuthorisationToken = SpotifyAuthorisationToken(auth_code)
    spotify.auth_token = auth_token
    spotify.reauthorize()

    return jsonify(OAuth_Token=auth_code)


@mod.route("spotify/search")
@login_required
def search_for_songs():
    search_term = request.args.get('searchterm')

    if search_term is None or search_term is "":
        return abort(400)

    search_results = spotify.search(search_term, "track", limit=10)
    return_search_results = modify_track_json(search_results["tracks"])
    return return_search_results


@mod.route("/spotify/playlist")
@login_required
def get_playlist():
    settings = get_settings()
    playlist_id = settings["playlist-id"]

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
