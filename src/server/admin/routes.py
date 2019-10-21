from flask import Blueprint, request
from flask_login import login_required, current_user

from server.admin.admin_functions import spotify_user_display, spotify_user_playlist_display

mod = Blueprint("admin", __name__, template_folder='templates')


@mod.route("/")
@login_required
def admin_page():
    if not current_user.is_admin:
        return "You are not authorized to visit this page"

    spotify_user_id = request.args.get("spotify-user-id")

    if spotify_user_id:
        return spotify_user_playlist_display(spotify_user_id)
    else:
        return spotify_user_display()
