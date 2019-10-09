from flask import render_template, flash, redirect, request, Response, jsonify, url_for
from flask_login import current_user, login_user, login_required, logout_user
from pyfy import Spotify

from server import app
from server.functions import get_settings, add_tracks, modify_json
from server.forms import LoginForm
from server.modals import User


@app.errorhandler(404)
def page_not_found(*args):
    return render_template('404.html', title="404 - Page not found"), 404


@app.route("/")
@login_required
def home():
    return render_template("index.html", title="Home")


@app.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("home"))

    form = LoginForm()

    # checks if all relevant data filed have been filled
    if form.validate_on_submit():
        # get the user that logged in
        user = User.query.filter_by(username=form.username.data).first()

        # todo remember username
        # if the user does not exist or has the wrong password
        if user is None or not user.check_password(form.password.data):
            flash("Invalid username or password")
            return redirect(url_for("login"))

        # login the user
        login_user(user, remember=form.remember_me.data)
        return redirect(url_for("home"))

    if request.method == "POST":
        flash("You missed to fill some fields")
        return render_template('login.html', title='Sign In', form=form)

    return render_template('login.html', title='Sign In', form=form)


@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for('home'))


@app.route("/admin")
@login_required
def admin_page():
    return "Under construction"


@app.route("/api/v1/spotify/playlist")
def get_playlist():
    settings = get_settings()

    auth_token = settings["OAuth-Token"]
    playlist_id = settings["playlist-id"]

    spo = Spotify(auth_token)
    playlist = spo.playlist(playlist_id=playlist_id)

    return playlist


@app.route("/api/v1/spotify/playlist/tracks")
def get_playlist_tracks():
    settings = get_settings()

    auth_token = settings["OAuth-Token"]
    playlist_id = settings["playlist-id"]

    spo = Spotify(auth_token)
    tracks = spo.playlist_tracks(playlist_id=playlist_id)

    modified_tracks = modify_json(tracks)

    return jsonify(modified_tracks)


# curl -d '{"track-list":"[2c5Isyd07hWsl7AQia2Dig,5a3rLTbh7L7lBj5cflW3sf]"}' -H "Content-Type: application/json" -X POST http://127.0.0.1:5000/api/v1/spotify/playlist/add
@app.route("/api/v1/spotify/playlist/add", methods=['POST', 'GET'])
def add_track_to_playlist():
    json = request.get_json()

    if "track-list" in json:
        add_tracks(json["track-list"])
        return Response(status=201)
    else:
        return Response(status=400)
