import time

from flask import Blueprint, jsonify, request, Response, redirect, abort
from flask_login import login_required, current_user

from server import spotify, spotify_info, db
from server.admin.admin_functions import add_playlist_to_spotify_user
from server.api.api_functions import modify_playlist_json, modify_track_json, collect_tracks, update_user, \
    get_token_by_playlist
from server.main.modals import Playlist
from server.spotify import SpotifyAuthorisationToken

mod = Blueprint("api", __name__)


@mod.route("/authorize")
@login_required
def authorize():
    if not current_user.is_admin:
        return "You are not authorized to visit this page"

    url = spotify.build_authorize_url(show_dialog=False)
    return redirect(url)


@mod.route("/callback/")
@login_required
def callback():
    if not current_user.is_admin:
        return "You are not authorized to visit this page"

    if request.args.get("error"):
        return jsonify(dict(error=request.args.get("error_description")))
    else:
        callback_state = request.args.get("state")

        if callback_state != spotify_info.state:
            return f"The state was not the same. The returned state was {callback_state}"

    auth_code: str = request.args.get("code")
    auth_token: SpotifyAuthorisationToken = SpotifyAuthorisationToken(refresh_token=auth_code,
                                                                      activation_time=int(time.time()))

    # Check if expired and update the user
    auth_token = spotify.reauthorize(auth_token, grant_type="authorization_code")
    auth_token = spotify.reauthorize(auth_token)
    user_id = spotify.me(auth_token)["id"]
    update_user(user_id, auth_token)

    return jsonify(OAuth_Token=auth_token.token, Reauthorization_Token=auth_token.refresh_token)


@mod.route("/reauthorize")
@login_required
def reauthorize():
    playlist_id = request.args.get('playlist-id')

    if not playlist_id:
        return abort(400, "You did not give a playlist-id")

    auth_token = get_token_by_playlist(playlist_id)

    if not auth_token:
        return abort(400, "No playlist with this id found")

    return jsonify(OAuth_Token=spotify.reauthorize(auth_token).token)


@mod.route("playlist/add", methods=['POST', 'GET'])
@login_required
def add_playlist():
    if not current_user.is_admin:
        return "You are not authorized to visit this page"

    playlist_id = request.args.get("playlist-id")
    if not playlist_id:
        return abort(400, "You passed an empty playlist")

    return add_playlist_to_spotify_user(playlist_id)


@mod.route("playlist/remove")
@login_required
def remove_playlist():
    if not current_user.is_admin:
        return "You are not authorized to visit this page"

    playlist_id = request.args.get("playlist-id")
    if not playlist_id:
        return abort(400, "You passed an empty playlist")

    playlist = Playlist.query.filter(Playlist.spotify_id == playlist_id).first()
    if not playlist:
        return abort(400, "The playlist id you provided does not exist")

    db.session.delete(playlist)
    db.session.commit()
    return ""


@mod.route("/spotify/search")
@login_required
def search_for_songs():
    playlist_id = request.args.get('playlist-id')

    if not playlist_id:
        return abort(400, "You did not give a playlist-id")

    auth_token = get_token_by_playlist(playlist_id)

    if not auth_token:
        return abort(400, "No playlist with this id found")

    # Check if expired and update the user
    if auth_token.is_expired():
        auth_token = spotify.reauthorize(auth_token)
        user_id = spotify.me(auth_token)["id"]
        update_user(user_id, auth_token)

    search_term = request.args.get('searchterm')

    if search_term is None or search_term is "":
        return abort(400)

    search_results = spotify.search(search_term, "track", auth_token, limit=10)

    return_search_results = modify_track_json(search_results["tracks"])
    return return_search_results


@mod.route("/spotify/playlist")
@login_required
def get_playlist():
    playlist_id = request.args.get('playlist-id')

    if not playlist_id:
        return abort(400, "You did not give a playlist-id")

    auth_token = get_token_by_playlist(playlist_id)

    if not auth_token:
        return abort(400, "No playlist with this id found")

    # Check if expired and update the user
    if auth_token.is_expired():
        auth_token = spotify.reauthorize(auth_token)
        user_id = spotify.me(auth_token)["id"]
        update_user(user_id, auth_token)

    playlist = spotify.playlist(playlist_id=playlist_id, auth_token=auth_token)
    modified_playlist = modify_playlist_json(playlist)

    return modified_playlist


@mod.route("/spotify/playlist/tracks")
@login_required
def get_playlist_tracks():
    playlist_id = request.args.get('playlist-id')

    if not playlist_id:
        return abort(400, "You did not give a playlist-id")

    auth_token = get_token_by_playlist(playlist_id)

    if not auth_token:
        return abort(400, "No playlist with this id found")

    # Check if expired and update the user
    if auth_token.is_expired():
        auth_token = spotify.reauthorize(auth_token)
        user_id = spotify.me(auth_token)["id"]
        update_user(user_id, auth_token)

    modified_tracks = collect_tracks(playlist_id, auth_token)

    return jsonify(modified_tracks)


@mod.route("/spotify/playlist/add", methods=['POST', 'GET'])
@login_required
def add_track_to_playlist():
    playlist_id = request.args.get('playlist-id')

    if not playlist_id:
        return abort(400, "You did not give a playlist-id")

    auth_token = get_token_by_playlist(playlist_id)

    if not auth_token:
        return abort(400, "No playlist with this id found")

    # Check if expired and update the user
    if auth_token.is_expired():
        auth_token = spotify.reauthorize(auth_token)
        user_id = spotify.me(auth_token)["id"]
        update_user(user_id, auth_token)

    json = request.get_json()

    if "track-list" in json:
        spotify.add_playlist_tracks(playlist_id, json["track-list"], auth_token)
        return Response(status=201)
    else:
        return abort(400, "Your request body has not track-list")


@mod.route("/spotify/me")
@login_required
def me():
    playlist_id = request.args.get('playlist-id')

    if not playlist_id:
        return abort(400, "You did not give a playlist-id")

    auth_token = get_token_by_playlist(playlist_id)

    if not auth_token:
        return abort(400, "No playlist with this id found")

    # Check if expired and update the user
    if auth_token.is_expired():
        auth_token = spotify.reauthorize(auth_token)
        user_id = spotify.me(auth_token)["id"]
        update_user(user_id, auth_token)

    return spotify.me(auth_token=auth_token)
