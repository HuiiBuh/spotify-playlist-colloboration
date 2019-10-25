from flask import render_template, abort, jsonify

from server import SpotifyAuthorisationToken, spotify, db
from server.api.api_functions import update_user, modify_playlist_json
from server.main.modals import SpotifyUser, Playlist, User
from server.spotify.spotify import SpotifyError


def display_spotify_users():
    spotify_user_list = SpotifyUser.query.all()

    user_json_list = {}
    for spotify_user in spotify_user_list:
        oauth_token: SpotifyAuthorisationToken = SpotifyAuthorisationToken(refresh_token=spotify_user.refresh_token,
                                                                           activation_time=spotify_user.activated_at,
                                                                           authorisation_token=spotify_user.oauth_token)

        if oauth_token.is_expired():
            oauth_token = spotify.reauthorize(oauth_token)
            user_id = spotify.me(oauth_token)["id"]
            update_user(user_id, oauth_token)

        user_json_list[spotify_user.spotify_user_id] = spotify.me(oauth_token)
        user_json_list[spotify_user.spotify_user_id]["playlist_count"] = Playlist.query.filter(
            Playlist.spotify_user == spotify_user.id).count()

    return render_template("spotify_users.html", spotify_users=user_json_list, title="Users")


def display_spotify_user_playlists(spotify_user_id: str):
    user: SpotifyUser = SpotifyUser.query.filter(SpotifyUser.spotify_user_id == spotify_user_id).first()
    playlist_list = Playlist.query.filter(Playlist.spotify_user == user.id).all()

    oauth_token: SpotifyAuthorisationToken = SpotifyAuthorisationToken(user.refresh_token, user.activated_at,
                                                                       user.oauth_token)
    if oauth_token.is_expired():
        oauth_token = spotify.reauthorize(oauth_token)
        user_id = spotify.me(oauth_token)["id"]
        update_user(user_id, oauth_token)

    playlist_list_json = {}
    for playlist in playlist_list:
        playlist_list_json[playlist.spotify_id] = modify_playlist_json(
            spotify.playlist(playlist.spotify_id, oauth_token))

    user_name = spotify.me(oauth_token)['display_name']

    return render_template("spotify_user_playlists.html", playlist_list_json=playlist_list_json,
                           user_name=user_name, title=f"{user_name}'s Playlists")


def add_playlist_to_spotify_user(playlist_id: str):
    if Playlist.query.filter(Playlist.spotify_id == playlist_id).first():
        return abort(400, "The playlist does already exist")

    temp_user: SpotifyUser = SpotifyUser.query.first()
    auth_token = SpotifyAuthorisationToken(temp_user.refresh_token, temp_user.activated_at,
                                           temp_user.oauth_token)

    if auth_token.is_expired():
        auth_token = spotify.reauthorize(auth_token)
        user_id = spotify.me(auth_token)["id"]
        update_user(user_id, auth_token)

    try:
        playlist_json = spotify.playlist(playlist_id, auth_token)
    except SpotifyError as e:
        if "Invalid playlist Id" in e:
            return abort(400, "One of the playlist ids you passed is not valid")

    playlist_json_owner = playlist_json["owner"]["id"]

    spotify_user_object: SpotifyUser = SpotifyUser.query.filter(
        SpotifyUser.spotify_user_id == playlist_json_owner).first()

    if not spotify_user_object:
        return abort(400, f"The user ({playlist_json_owner}) the playlist belongs to does not exist in the tool. \n"
                          f"You have to create it manually.")

    database_playlist = Playlist(spotify_id=playlist_id, spotify_user=spotify_user_object.id, user=None)
    db.session.add(database_playlist)
    db.session.commit()
    return playlist_json
