from flask import render_template

from server import SpotifyAuthorisationToken, spotify
from server.api.api_functions import update_user, modify_playlist_json
from server.main.modals import SpotifyUser, Playlist


def spotify_user_display():
    spotify_user_list = SpotifyUser.query.all()

    user_json_list = {}
    for spotify_user in spotify_user_list:
        oauth_token: SpotifyAuthorisationToken = SpotifyAuthorisationToken(refresh_token=spotify_user.refresh_token,
                                                                           activation_time=spotify_user.activated_at,
                                                                           authorisation_token=spotify_user.oauth_token)

        if oauth_token.is_expired():
            auth_token = spotify.reauthorize(oauth_token)
            user_id = spotify.me(auth_token)["id"]
            update_user(user_id, auth_token)

        user_json_list[spotify_user.spotify_user_id] = spotify.me(oauth_token)
        user_json_list[spotify_user.spotify_user_id]["playlist_count"] = Playlist.query.filter(
            Playlist.spotify_user == spotify_user.id).count()

    return render_template("add_spotify_user.html", spotify_users=user_json_list, title="Users")


def spotify_user_playlist_display(spotify_user_id: str):
    user: SpotifyUser = SpotifyUser.query.filter(SpotifyUser.spotify_user_id == spotify_user_id).first()
    playlist_list = Playlist.query.filter(Playlist.spotify_user == user.id).all()

    oauth_token: SpotifyAuthorisationToken = SpotifyAuthorisationToken(user.refresh_token, user.activated_at,
                                                                       user.oauth_token)
    if oauth_token.is_expired():
        auth_token = spotify.reauthorize(oauth_token)
        user_id = spotify.me(auth_token)["id"]
        update_user(user_id, auth_token)

    playlist_list_json = {}
    for playlist in playlist_list:
        playlist_list_json[playlist.spotify_id] = modify_playlist_json(
            spotify.playlist(playlist.spotify_id, oauth_token))

    user_name = spotify.me(oauth_token)['display_name']

    return render_template("spotify_user_playlists.html", playlist_list_json=playlist_list_json,
                           user_name=user_name, title=f"{user_name}'s Playlists")


def add_playlists_to_user(playlist_list: dict):

    for playlist_id, user in playlist_list.items():

        Playlist(spotify_id=playlist_id, spotify_user=)
