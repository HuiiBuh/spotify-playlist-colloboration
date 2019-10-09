from flask import render_template, request, Response, jsonify
from flask_login import login_required

from server import app, spotify
from server.functions import get_settings, add_tracks, modify_track_json, modify_playlist_json
from server.spotify import spotify


@app.errorhandler(404)
def page_not_found(*args):
    return render_template('404.html', title="404 - Page not found"), 404

