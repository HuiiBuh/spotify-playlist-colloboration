from flask import Flask, jsonify, request, Response
from pyfy import Spotify

from app.functions import get_settings, add_tracks

app = Flask(__name__)


@app.route("/api/v1/spotify/playlist")
def get_playlist():
    settings = get_settings("settings_production.json")

    auth_token = settings["OAuth-Token"]
    playlist_id = settings["playlist-id"]

    spo = Spotify(auth_token)
    playlist = spo.playlist(playlist_id=playlist_id)

    return playlist


@app.route("/api/v1/spotify/playlist/tracks")
def get_playlist_tracks():
    settings = get_settings("settings_production.json")

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


if __name__ == "__main__":
    app.run(host='0.0.0.0', port='8080', debug=True)
