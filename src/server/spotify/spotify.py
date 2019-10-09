import os

import pyfy
from flask import Flask, redirect, abort, request, jsonify, url_for

from pyfy import Spotify, ClientCreds, AuthError
from server.spotify.key_template_production import KEYS

app = Flask(__name__)

spt = Spotify()
client = ClientCreds()
state = "123"
scopes = ["playlist-modify-private", "playlist-modify-public"]

au = ""


@app.route("/authorize")
def authorize():
    export_keys()
    client.load_from_env()
    spt.client_creds = client
    if spt.is_oauth_ready:
        return redirect(spt.auth_uri(state="123", scopes=scopes))
    else:
        return (
            jsonify(
                {
                    "error_description": "Client needs client_id, client_secret and a redirect uri in order to handle OAauth properly"}
            ),
            500,
        )


@app.route("/callback/spotify/")  # You have to register this callback
def spotify_callback():
    if request.args.get("error"):
        return jsonify(dict(error=request.args.get("error_description")))
    elif request.args.get("code"):
        grant = request.args.get("code")
        callback_state = request.args.get("state")
        if callback_state != state:
            return abort(401)
        try:
            user_creds = spt.build_user_creds(grant=grant)
        except AuthError as e:
            return jsonify(dict(error_description=e.msg)), e.code
        else:
            au = user_creds.__dict__["access_token"]
            return user_creds.__dict__["access_token"]

    else:
        return abort(500)


@app.route("/dump_creds")
def dump_creds():
    return "Not Implemented"


@app.route("/")
def index():
    try:
        return spt.playlist_tracks(playlist_id="2w8QXdDhuMc3lfcUsdfgX9J1Bca")
    except pyfy.excs.ApiError:
        export_keys()
        client.load_from_env()
        spt.client_creds = client
        spt.authorize_client_creds(client_creds=client)

    return spt.playlist_tracks(playlist_id="2w8QXdDhuMc3lcUX9J1Bca")


@app.route("/tracks")
def tracks():
    return jsonify(spt.user_tracks())


@app.route("/playlists")
def playlists():
    return jsonify(spt.playlist_tracks())


def export_keys():
    for k, v in KEYS.items():
        if v:
            os.environ[k] = v
            print("export " + k + "=" + v)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
