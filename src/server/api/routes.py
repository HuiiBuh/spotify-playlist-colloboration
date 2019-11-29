import time

from flask import Blueprint, jsonify, request, Response, abort, make_response, redirect, url_for
from flask_login import login_required, current_user

from server import spotify, db, spotify_info
from server.api.api_functions import modify_playlist_json, modify_track_json, collect_tracks, update_spotify_user, \
    get_token_by_playlist, add_playlist_to_spotify_user, assign_playlists_to_user, check_songs
from server.main.modals import Playlist, SpotifyUser, User
from server.spotify import SpotifyAuthorisationToken

mod = Blueprint("api", __name__)


@mod.route("/spotify/search")
@login_required
def search_for_songs():
    """
    Search for songs and artists
    :return: The search results as json
    """

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
        update_spotify_user(user_id, auth_token)

    search_term = request.args.get('searchterm')

    if search_term is None or search_term == "":
        return abort(400)

    search_results = spotify.search(search_term, "track", auth_token, limit=10)

    return_search_results = modify_track_json(search_results["tracks"])
    return return_search_results


@mod.route("/spotify/playlist")
@login_required
def get_playlist():
    """
    Get a playlist
    :return: The json of the playlist
    """

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
        update_spotify_user(user_id, auth_token)

    playlist = spotify.playlist(playlist_id=playlist_id, auth_token=auth_token)
    modified_playlist = modify_playlist_json(playlist)

    return modified_playlist


@mod.route("/spotify/playlist/tracks")
@login_required
def get_playlist_tracks():
    """
    Get the tracks of a playlist
    :return: The tracks of the playlist as json
    """

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
        update_spotify_user(user_id, auth_token)

    modified_tracks = collect_tracks(playlist_id, auth_token)

    return jsonify(modified_tracks)


@mod.route("/spotify/playlist/add", methods=['POST', 'GET'])
@login_required
def add_track_to_playlist():
    """
    Add tracks to the playlist
    :return: status 201, or 400
    """

    playlist_id: str = request.args.get('playlist-id')

    if not playlist_id:
        return abort(400, "You did not give a playlist-id")

    auth_token = get_token_by_playlist(playlist_id)

    if not auth_token:
        return abort(400, "No playlist with this id found")

    # Check if expired and update the user
    if auth_token.is_expired():
        auth_token = spotify.reauthorize(auth_token)
        user_id = spotify.me(auth_token)["id"]
        update_spotify_user(user_id, auth_token)

    json = request.get_json()

    if "track-list" in json:
        track_list = json["track-list"]
    else:
        return abort(400, "Your request body has not track-list")

    track_list = check_songs(track_list, auth_token, playlist_id)

    if not track_list:
        return abort(400, "You passed an empty message")

    spotify.add_playlist_tracks(playlist_id, track_list, auth_token)
    return Response(status=201)


@mod.route("/spotify/me")
@login_required
def me():
    """
    Get information about the auth token for the playlist
    :return: Information about the playlist spotify user
    """

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
        update_spotify_user(user_id, auth_token)

    return spotify.me(auth_token=auth_token)


# ADMIN ################################################################################################################

@mod.route("/authorize")
@login_required
def authorize():
    """
    Authorize a new spotify user
    :return: A redirect to the right spotify url, 403
    """

    if not current_user.is_admin:
        return abort(403, "You are not authorized to visit the page")

    url = spotify.build_authorize_url(show_dialog=False)
    return redirect(url)


@mod.route("/callback/")
@login_required
def callback():
    """
    Callback that will be called if the user authorizes the first time
    :return: A redirect to the spotify user home page, 403
    """

    if not current_user.is_admin:
        return abort(403, "You are not authorized to visit the page")

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
    update_spotify_user(user_id, auth_token)

    # return jsonify(OAuth_Token=auth_token.token, Reauthorization_Token=auth_token.refresh_token)
    return redirect(url_for("admin.spotify_users"))


@mod.route("/reauthorize")
@login_required
def reauthorize():
    """
    Reauthorize the spotify oauth code
    :return: The tokens, 400, 403
    """

    if not current_user.is_admin:
        return abort(403, "You are not authorized to visit the page")

    playlist_id = request.args.get('playlist-id')

    if not playlist_id:
        return abort(400, "You did not give a playlist-id")

    auth_token = get_token_by_playlist(playlist_id)

    if not auth_token:
        return abort(400, "No playlist with this id found")

    return jsonify(OAuth_Token=spotify.reauthorize(auth_token).token)


@mod.route("playlist/user/add", methods=["POST", "GET"])
@login_required
def add_playlists_to_user():
    """
    Add a user to a spotify playlist
    :return: 200, 400, 403
    """

    if not current_user.is_admin:
        return abort(403, "You are not authorized to visit the page")

    request_json = request.get_json()

    if not request_json or ("playlists" and "user-id") not in request_json:
        return abort(400, "You did not pass a playlist or user-id")

    playlist_list: list = request_json["playlists"]

    if not playlist_list:
        return abort(400, "You did not select a playlist")

    user_id = request_json["user-id"]

    status, data = assign_playlists_to_user(playlist_list, user_id)
    return make_response(jsonify(data), status)


@mod.route("/playlist/user/remove", methods=["POST", "GET"])
@login_required
def remove_playlist_from_user():
    """
    Removes a playlist from a user
    :return: 200, 400, 403
    """

    if not current_user.is_root:
        return abort(403, "Only root users can delete a spotify user")

    request_json: dict = request.get_json()

    if not request_json or "playlist-id" not in request_json and "user-id" not in request_json:
        return abort(400, "You did not provide a playlist id or a user id")

    playlist_id: str = request_json["playlist-id"]
    user_id: str = request_json["user-id"]

    user: User = User.query.filter(User.id == user_id).first()
    if not user:
        return abort(400, "You did not provide a valid user")

    playlist: Playlist = Playlist.query.filter(Playlist.spotify_id == playlist_id).first()
    if not playlist:
        return abort(400, "You did not provide a valid playlist")

    playlist_list: list = user.playlists

    if playlist not in playlist_list:
        return abort(400, "The use has your playlist not assigned to him")

    user.playlists.remove(playlist)
    db.session.commit()

    return ""


@mod.route("playlist/add", methods=['POST', 'GET'])
@login_required
def add_playlist():
    """
    Add a playlist to a spotify user
    :return: The playlist json or 400, 403
    """

    if not current_user.is_admin:
        return abort(403, "You are not authorized to visit the page")

    playlist_id: str = request.args.get("playlist-id")
    spotify_user_id: str = request.args.get("spotify-user-id")
    song_length: str = request.args.get("song-length")

    if not song_length or not song_length.isdigit():
        song_length = "0"
    song_length: int = abs(int(song_length))

    if song_length.bit_length() >= 63:
        song_length: int = 0

    if not playlist_id or not spotify_user_id:
        return abort(400, "You passed an empty playlistor spotify user")

    return add_playlist_to_spotify_user(playlist_id, spotify_user_id, song_length)


@mod.route("playlist/remove")
@login_required
def remove_playlist():
    """
    Remove playlist form a spotify user
    :return: status 400, 200
    """
    if not current_user.is_admin:
        return abort(403, "You are not authorized to visit the page")

    playlist_id = request.args.get("playlist-id")
    if not playlist_id:
        return abort(400, "You passed an empty playlist")

    playlist = Playlist.query.filter(Playlist.spotify_id == playlist_id).first()
    if not playlist:
        return abort(400, "The playlist id you provided does not exist")

    db.session.delete(playlist)
    db.session.commit()
    return ""


@mod.route("/spotify-user/remove")
@login_required
def remove_spotify_user():
    """
    Remove a spotify user
    :return: status 400, 200
    """

    if not current_user.is_admin:
        return abort(403, "You are not authorized to visit the page")

    if not current_user.is_root:
        return abort(403, "You have to bee root to remove spotify users")

    spotify_user_id = request.args.get("spotify-user-id")
    if not spotify_user_id:
        return abort(400, "You did not pass a spotify user")

    spotify_user = SpotifyUser.query.filter(SpotifyUser.spotify_user_id == spotify_user_id).first()

    if not spotify_user:
        return abort(400, "The spotify user id you provided does not exist")

    db.session.delete(spotify_user)
    db.session.commit()
    return ""


@mod.route("/playlist/duration")
@login_required
def update_playlist_duration():
    """
    Updates the duration of the playlist
    :return: status 400, 200
    """

    if not current_user.is_admin:
        return abort(403, "You are not authorized to visit the page")

    playlist_id = request.args.get("playlist-id")
    duration: str = request.args.get("duration")

    if not duration or not playlist_id:
        return abort(400, "You did not provide a playlist id or duration")

    if not duration.isdigit():
        return abort(400, "The duration you provided is not a digit but " + duration)

    duration: int = abs(int(duration))

    if duration.bit_length() > 63:
        duration: int = 0

    playlist = Playlist.query.filter(Playlist.spotify_id == playlist_id).first()
    if not playlist:
        return abort(400, f"The playlist {playlist_id} id you provided was not found")

    playlist.max_song_length = duration
    db.session.commit()
    return ""


@mod.route("/user/remove")
@login_required
def remove_user():
    """
    Remove a user
    :return: status 400, 200
    """

    if not current_user.is_admin:
        return abort(403, "You are not authorized to visit the page")

    user_id = request.args.get("user-id")

    if not user_id:
        return abort(400, "You did not pass a user")

    user = User.query.filter(User.id == user_id).first()

    if not user:
        return abort(400, "The user id you provided does not exist")

    if user.is_admin and not current_user.is_root:
        return abort(400, "You can not remove admin users")

    if user.is_root:
        return abort(400, "You can not delete the root user")

    db.session.delete(user)
    db.session.commit()
    return ""
