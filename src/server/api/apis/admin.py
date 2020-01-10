import time

from flask import request, redirect, jsonify, url_for, make_response
from flask_login import login_required, current_user

from server import spotify, spotify_info, db
from server.api.api_functions import update_spotify_user, get_token_by_playlist, assign_playlists_to_user, \
    add_playlist_to_spotify_user
from server.api.routes import mod
from server.main.modals import User, Playlist, SpotifyUser, Queue
from server.spotify import SpotifyAuthorisationToken


@mod.route("/authorize")
@login_required
def authorize():
    """
    Authorize a new spotify user
    :return: A redirect to the right spotify url, 403
    """

    if not current_user.is_admin:
        return "You are not authorized to visit the page", 403

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
        return "You are not authorized to visit the page", 403

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
        return "You are not authorized to visit the page", 403

    playlist_id = request.args.get('playlist-id')

    if not playlist_id:
        return "You did not give a playlist-id", 400

    auth_token = get_token_by_playlist(playlist_id)

    if not auth_token:
        return "No playlist with this id found", 400

    return jsonify(OAuth_Token=spotify.reauthorize(auth_token).token)


@mod.route("/playlist/user/add", methods=["POST", "GET"])
@login_required
def add_playlists_to_user():
    """
    Add a user to a spotify playlist
    :return: 200, 400, 403
    """

    if not current_user.is_admin:
        return "You are not authorized to visit the page", 403

    request_json = request.get_json()

    if not request_json or ("playlists" and "user-id") not in request_json:
        return "You did not pass a playlist or user-id", 400

    playlist_list: list = request_json["playlists"]

    if not playlist_list:
        return "You did not select a playlist", 400

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
        return "Only root users can delete a spotify user", 403

    request_json: dict = request.get_json()

    if not request_json or "playlist-id" not in request_json and "user-id" not in request_json:
        return "You did not provide a playlist id or a user id", 400

    playlist_id: str = request_json["playlist-id"]
    user_id: str = request_json["user-id"]

    user: User = User.query.filter(User.id == user_id).first()
    if not user:
        return "You did not provide a valid user", 400

    playlist: Playlist = Playlist.query.filter(Playlist.spotify_id == playlist_id).first()
    if not playlist:
        return "You did not provide a valid playlist", 400

    playlist_list: list = user.playlists

    if playlist not in playlist_list:
        return "The use has your playlist not assigned to him", 400

    user.playlists.remove(playlist)
    db.session.commit()

    return ""


@mod.route("/playlist/add", methods=['POST', 'GET'])
@login_required
def add_playlist():
    """
    Add a playlist to a spotify user
    :return: The playlist json or 400, 403
    """

    if not current_user.is_admin:
        return "You are not authorized to visit the page", 403

    playlist_id: str = request.args.get("playlist-id")
    spotify_user_id: str = request.args.get("spotify-user-id")
    song_length: str = request.args.get("song-length")

    if not song_length or not song_length.isdigit():
        song_length = "0"
    song_length: int = abs(int(song_length))

    if song_length.bit_length() >= 63:
        song_length: int = 0

    if not playlist_id or not spotify_user_id:
        return "You passed an empty playlist or spotify user", 400

    return add_playlist_to_spotify_user(playlist_id, spotify_user_id, song_length)


@mod.route("/playlist/remove")
@login_required
def remove_playlist():
    """
    Remove playlist form a spotify user
    :return: status 400, 200
    """

    if not current_user.is_admin:
        return "You are not authorized to visit the page", 403

    playlist_id = request.args.get("playlist-id")
    if not playlist_id:
        return "You passed an empty playlist", 400

    playlist = Playlist.query.filter(Playlist.spotify_id == playlist_id).first()
    if not playlist:
        return "The playlist id you provided does not exist", 400

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
        return "You are not authorized to visit the page", 403

    if not current_user.is_root:
        return "You have to bee root to remove spotify users", 403

    spotify_user_id = request.args.get("spotify-user-id")
    if not spotify_user_id:
        return "You did not pass a spotify user", 400

    spotify_user = SpotifyUser.query.filter(SpotifyUser.spotify_user_id == spotify_user_id).first()

    if not spotify_user:
        return "The spotify user id you provided does not exist", 400

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
        return "You are not authorized to visit the page", 403

    playlist_id = request.args.get("playlist-id")
    duration: str = request.args.get("duration")

    if not duration or not playlist_id:
        return "You did not provide a playlist id or duration", 400

    if not duration.isdigit():
        return "The duration you provided is not a digit but " + duration, 400

    duration: int = abs(int(duration))

    if duration.bit_length() > 63:
        duration: int = 0

    playlist = Playlist.query.filter(Playlist.spotify_id == playlist_id).first()
    if not playlist:
        return f"The playlist {playlist_id} id you provided was not found", 400

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
        return "You are not authorized to visit the page", 403

    user_id = request.args.get("user-id")

    if not user_id:
        return "You did not pass a user", 400

    user = User.query.filter(User.id == user_id).first()

    if not user:
        return "The user id you provided does not exist", 400

    if user.is_admin and not current_user.is_root:
        return "You can not remove admin users", 403

    if user.is_root:
        return "You can not delete the root user", 403

    db.session.delete(user)
    db.session.commit()
    return ""


@mod.route("/<spotify_user_id>/playback", methods=["POST"])
@login_required
def toggle_playback_control(spotify_user_id):
    """
    Toggle the playback control of a spotify user
    :param spotify_user_id: The spotify user id
    :return:
    """

    if not current_user.is_admin:
        return "You are not authorized to visit the page", 403

    spotify_user: SpotifyUser = SpotifyUser.query.filter(SpotifyUser.spotify_user_id == spotify_user_id).first()
    if not spotify_user:
        return "No user with this id was found", 404

    queue = request.args.get("queue")
    if not queue:
        return "Parameter queue is missing", 404

    if queue == "false":
        db.session.delete(spotify_user.queue)
        spotify_user.queue = None
        db.session.commit()
        return "Disabled the playback control"

    spotify_user.queue = Queue(shuffle=False, repeat_all=True, spotify_user_id=spotify_user_id)
    db.session.commit()
    return "Enabled the playback control"
