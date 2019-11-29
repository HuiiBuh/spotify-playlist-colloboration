from flask import Blueprint, render_template, redirect, url_for, request, flash
from flask_login import login_required, current_user, logout_user, login_user

from server import spotify
from server.api.api_functions import get_token_by_playlist, modify_playlist_json
from server.main.forms import LoginForm
from server.main.modals import User, Playlist

mod = Blueprint("main", __name__, template_folder='templates')


@mod.route("/")
@login_required
def home() -> render_template:
    """
    The default rote that lets you select a playlist
    :return: A template
    """

    playlist_id = request.args.get('playlist-id')

    # Check if the playlist id is present
    if not playlist_id:
        user = current_user.id
        playlist_list = Playlist.query.join(User.playlists).filter(User.id == user).all()

        playlist_list_json = {}
        for playlist in playlist_list:
            auth_token = get_token_by_playlist(playlist.spotify_id)

            if auth_token:
                playlist_list_json[playlist.spotify_id] = \
                    modify_playlist_json(spotify.playlist(playlist.spotify_id, auth_token))

        return render_template("select.html", title="Select Playlist", playlist_list_json=playlist_list_json)

    # Get a playlist from the database
    spotify_playlist:Playlist = Playlist.query.filter(Playlist.spotify_id == playlist_id).first()

    # If the playlist is not in the db render the resource not found
    if not spotify_playlist:
        return render_template("resource_not_found.html")

    # Render the playlist page
    return render_template("playlist.html", title="Home", playlist_id=playlist_id, spotify_playlist=spotify_playlist)


@mod.route("/login", methods=["GET", "POST"])
def login() -> redirect:
    """
    Login page
    :return: A redirect
    """

    # Redirect the user to home if he is authenticated
    if current_user.is_authenticated:
        return redirect(url_for("main.home"))

    form = LoginForm()

    # checks if all relevant data filed have been filled
    if form.validate_on_submit():
        # get the user that logged in
        user = User.query.filter_by(username=form.username.data).first()

        # if the user does not exist or has the wrong password
        if user is None or not user.check_password(form.password.data):
            flash({"contend": "Invalid username or password", "type": "bg-warning"})
            return redirect(url_for("main.login"))

        # login the user
        login_user(user, remember=form.remember_me.data)
        next_page = request.args.get("next")
        if next_page:
            if not next_page[0] == "/":
                next_page = "/" + next_page

            return redirect(f"{next_page}")
        else:
            return redirect(url_for("main.home"))

    # Handle invalid form
    if request.method == "POST":
        flash({"contend": "You missed some input fields", "type": "bg-warning"})
        return render_template('login.html', title='Sign In', form=form)

    return render_template('login.html', title='Sign In', form=form)


@mod.route("/logout")
@login_required
def logout():
    """
    Logout the user
    :return:
    """
    logout_user()
    return redirect(url_for('main.login'))
