from flask import Flask, jsonify, request, Response, render_template, flash, redirect
from pyfy import Spotify

from app.functions import get_settings, add_tracks
from app.login import LoginForm

app = Flask(__name__)

app.config["SECRET_KEY"] = "HuiBuh"


@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html', title="404 - Page not found"), 404


@app.route("/api/v1/spotify/playlist")
def get_playlist():
    settings = get_settings()

    auth_token = settings["OAuth-Token"]
    playlist_id = settings["playlist-id"]

    spo = Spotify(auth_token)
    playlist = spo.playlist(playlist_id=playlist_id)

    return playlist


@app.route("/login", methods=["GET", "POST"])
def login_user():
    form = LoginForm()

    if form.validate_on_submit():
        flash(f'Login requested for user {form.username.data} with password {form.password.data}, remember_me={form.remember_me.data}')
        return redirect('/')

    if request.method == "POST":
        flash("You have to fill some fields")
        return render_template('login.html', title='Sign In', form=form)

    return render_template('login.html', title='Sign In', form=form)


@app.route("/api/v1/spotify/playlist/tracks")
def get_playlist_tracks():
    settings = get_settings()

    auth_token = settings["OAuth-Token"]
    playlist_id = settings["playlist-id"]

    spo = Spotify(auth_token)
    tracks = spo.playlist_tracks(playlist_id=playlist_id)

    return jsonify(tracks)


# curl -d '{"track-list":"[2c5Isyd07hWsl7AQia2Dig,5a3rLTbh7L7lBj5cflW3sf]"}' -H "Content-Type: application/json" -X POST http://127.0.0.1:5000/api/v1/spotify/playlist/add
@app.route("/api/v1/spotify/playlist/add", methods=['POST'])
def add_track_to_playlist():
    json = request.get_json()

    if "track-list" in json:
        add_tracks(json["track-list"])
        return Response(status=201)
    else:
        return Response(status=400)
