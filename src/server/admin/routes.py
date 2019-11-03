from argon2 import PasswordHasher, Type
from flask import Blueprint, request, render_template, redirect, url_for
from flask_login import login_required, current_user

from server import db, spotify
from server.admin.admin_functions import display_spotify_users, display_spotify_user_playlists
from server.admin.forms import AddUserForm
from server.api.api_functions import get_token_by_playlist
from server.main.modals import User, Playlist

mod = Blueprint("admin", __name__, template_folder='templates')


@mod.route("/")
@login_required
def index():
    if not current_user.is_admin:
        return "You are not authorized to visit this page"

    return "Under construction"


@mod.route("/spotify-users")
@login_required
def spotify_users():
    if not current_user.is_admin:
        return "You are not authorized to visit this page"

    spotify_user_id = request.args.get("spotify-user-id")

    if spotify_user_id:
        return display_spotify_user_playlists(spotify_user_id)
    else:
        return display_spotify_users()


@mod.route("/users")
@login_required
def users():
    if not current_user.is_admin:
        return "You are not authorized to visit this page"

    user_id = request.args.get("user-id")
    if user_id:
        user = User.query.filter(User.id == user_id).first()
        if user:
            playlist_list = Playlist.query.join(User.playlists).filter(User.id == user.id).all()

            playlist_json = []
            for playlist in playlist_list:
                auth_token = get_token_by_playlist(playlist.spotify_id)
                playlist_json.append(spotify.playlist(playlist.spotify_id, auth_token))

            all_playlists = Playlist.query.all()

            all_playlists_list = []
            for playlist in all_playlists:
                indicator = True
                for p in playlist_json:
                    if not playlist.spotify_id == p.id:
                        indicator = False
                if indicator:
                    auth_token = get_token_by_playlist(playlist.spotify_id)
                    if auth_token.is_expired():
                        auth_token = spotify.reauthorize(auth_token)
                    p_json = spotify.playlist(playlist.spotify_id, auth_token)

                    all_playlists_list.append(p_json)

            return render_template("edit_user.html", title="Edit Users", user=user, playlist_list=playlist_json,
                                   all_playlists_list=all_playlists_list)
        else:
            return render_template("resource_not_found.html")

    user_list = User.query.all()
    form = AddUserForm()

    updated_user_list = []
    for user in user_list:
        # TODO Playlist.user sind mehrere

        playlist_count = Playlist.query.join(User.playlists).filter(User.id == user.id).all()
        user.playlist_count = len(playlist_count)
        updated_user_list.append(user)

    return render_template("users.html", title="Users", user_list=updated_user_list, form=form)


@mod.route("/user/add", methods=["POST", "GET"])
@login_required
def add_user():
    if not current_user.is_admin:
        return "You are not authorized to visit this page"

    ph = PasswordHasher(type=Type.ID)
    password = ph.hash(request.form["password"])
    username = request.form["username"]

    if "is_admin" in request.form:
        admin = True
    else:
        admin = False

    if User.query.filter(User.username == username).first():
        return redirect(url_for("admin.users"))

    user = User(username=username, password_hash=password, is_admin=admin)
    db.session.add(user)
    db.session.commit()

    return redirect(url_for("admin.users"))
