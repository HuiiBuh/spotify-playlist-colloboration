from flask import Blueprint, render_template
from flask_login import login_required, current_user

from server import SpotifyAuthorisationToken, spotify
from server.main.modals import SpotifyUser, Playlist

mod = Blueprint("admin", __name__, template_folder='templates')


@mod.route("/")
@login_required
def admin_page():
    if not current_user.is_admin:
        return "You are not authorized to visit this page"

    spotify_user_list = SpotifyUser.query.all()

    user_json_list = {}
    for spotify_user in spotify_user_list:
        oauth_token: SpotifyAuthorisationToken = SpotifyAuthorisationToken(refresh_token=spotify_user.refresh_token,
                                                                           activation_time=spotify_user.activated_at,
                                                                           authorisation_token=spotify_user.oauth_token)

        if oauth_token.is_expired():
            oauth_token = spotify.reauthorize(oauth_token)

        user_json_list[spotify_user.spotify_user_id] = spotify.me(oauth_token)
        user_json_list[spotify_user.spotify_user_id]["playlist_count"] = Playlist.query.filter(
            Playlist.spotify_user == spotify_user.id).count()

    return render_template("add_spotify_user.html", spotify_users=user_json_list)
