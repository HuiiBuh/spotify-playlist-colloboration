import re

from flask import render_template
from flask_login import current_user

from server import spotify
from server.admin.forms import AddUserForm, ChangePasswordForm
from server.api.api_functions import update_spotify_user, modify_playlist_json, get_token_by_playlist
from server.main.modals import SpotifyUser, Playlist, User
from server.spotify import SpotifyAuthorisationToken


def display_all_spotify_users() -> render_template:
    """
    Display all spotify users
    :return: A rendered template
    """

    # Get all spotify users
    spotify_user_list = SpotifyUser.query.all()

    # Json with all the user data
    user_json_list = {}
    for spotify_user in spotify_user_list:
        # Get a auth token for every spotify user
        oauth_token: SpotifyAuthorisationToken = SpotifyAuthorisationToken(refresh_token=spotify_user.refresh_token,
                                                                           activation_time=spotify_user.activated_at,
                                                                           authorisation_token=spotify_user.oauth_token)

        # Check if token is expired
        if oauth_token.is_expired():
            oauth_token = spotify.reauthorize(oauth_token)
            user_id = spotify.me(oauth_token)["id"]
            update_spotify_user(user_id, oauth_token)

        # Get information from the database and spotify and store it in the json
        user_json_list[spotify_user.spotify_user_id] = spotify.me(oauth_token)
        user_json_list[spotify_user.spotify_user_id]["playlist_count"] = Playlist.query.filter(
            Playlist.spotify_user == spotify_user.id).count()

    # Return the rendered template
    return render_template("spotify_user/spotify_users.html", spotify_users=user_json_list, title="Spotify Users")


def display_all_users() -> render_template:
    """
    Display all users
    :return: The rendered template
    """

    # Get all users from the database
    user_list = User.query.all()
    # Get the add user form
    form = AddUserForm()

    # Get information about the user and store it in the database
    updated_user_list = []
    for user in user_list:
        playlist_count = Playlist.query.join(User.playlists).filter(User.id == user.id).all()
        user.playlist_count = len(playlist_count)
        updated_user_list.append(user)

    return render_template("user/users.html", title="Users", user_list=updated_user_list, form=form)


def display_spotify_user_playlists(spotify_user_id: str):
    """
    Display the playlists of one spotify user
    :param spotify_user_id: The user id of the spotify user
    :return: A rendered template of the page
    """

    # Get the spotify user from the database
    spotify_user: SpotifyUser = SpotifyUser.query.filter(SpotifyUser.spotify_user_id == spotify_user_id).first()

    # Check if spotify user exists
    if not spotify_user:
        return render_template("resource_not_found.html", title="Resource not found", resource="Spotify User")

    # Get all playlists that are assigned to the spotify user
    playlist_list = Playlist.query.filter(Playlist.spotify_user == spotify_user.id).all()

    # Get the token from the user
    oauth_token: SpotifyAuthorisationToken = SpotifyAuthorisationToken(spotify_user.refresh_token,
                                                                       spotify_user.activated_at,
                                                                       spotify_user.oauth_token)
    # Check if the token is expired
    if oauth_token.is_expired():
        oauth_token = spotify.reauthorize(oauth_token)
        user_id = spotify.me(oauth_token)["id"]
        update_spotify_user(user_id, oauth_token)

    # Build the playlist json by the requests to spotify
    playlist_list_json = {}
    for playlist in playlist_list:
        playlist_list_json[playlist.spotify_id] = modify_playlist_json(
            spotify.playlist(playlist.spotify_id, oauth_token))
        playlist_list_json[playlist.spotify_id]["max_song_duration"] = playlist.max_song_length

    # Get the username of the spotify user
    user_name = spotify.me(oauth_token)['display_name']

    playlist_list = spotify.user_playlists(oauth_token)["items"]

    autocomplete_playlist_list = {}
    for playlist in playlist_list:
        if playlist["owner"]["id"] == spotify_user_id:
            try:
                autocomplete_playlist_list[playlist["name"] + " - " + playlist["id"]] = playlist["images"][2]["url"]
            except IndexError:
                autocomplete_playlist_list[
                    playlist["name"] + " - " + playlist["id"]] = "/static/icons/default_playlist_cover.png"

    return render_template("spotify_user/spotify_user_playlists.html",
                           playlist_list_json=playlist_list_json,
                           user_name=user_name,
                           title=f"{user_name}'s Playlists",
                           autocomplete_playlist_list=autocomplete_playlist_list)


def display_user(user_id: str):
    """
    Display information of one user
    :param user_id: THe user id
    :return:
    """
    # Get the user to the user id
    user = User.query.filter(User.id == user_id).first()
    if user:
        # Get all playlists of a user
        playlist_list = Playlist.query.join(User.playlists).filter(User.id == user.id).all()

        # Build the playlist json
        playlist_json = []

        # Get a auth_token for every playlist and get the information of the playlist with a api call
        for playlist in playlist_list:
            auth_token = get_token_by_playlist(playlist.spotify_id)

            if auth_token:
                playlist_json.append(spotify.playlist(playlist.spotify_id, auth_token))

        # Get all playlists
        all_playlists = Playlist.query.all()

        all_playlists_list = []
        for playlist in all_playlists:
            indicator = True
            # For every playlist that the user owns
            for p in playlist_json:
                # Check if the playlist (all) is in the playlists of the user

                if playlist.spotify_id == p["id"]:
                    indicator = False
            # If the user has not the playlist append it to the list
            if indicator:
                auth_token = get_token_by_playlist(playlist.spotify_id)

                if auth_token:
                    p_json = spotify.playlist(playlist.spotify_id, auth_token)
                    all_playlists_list.append(p_json)

        form = ChangePasswordForm()
        return render_template("user/edit_user.html", title="Edit Users", user=user, playlist_list=playlist_json,
                               all_playlists_list=all_playlists_list, form=form, user_id=int(user_id),
                               current_user_id=current_user.id)
    else:
        return render_template("resource_not_found.html", title="Resource not found", resource="User")


def password_complex_enough(password: str) -> bool:
    """
    Check if the password is complex enough
    :param password: The password that is supposed to be checked
    :return: Is the password complex enough
    """
    good_complexity = 12

    complexity = len(password)

    complexity += 2 if re.search(r"[A-Z]", password) and re.search(r"[a-z]", password) else 0

    complexity += 2 if re.search(r"\d", password) else 0
    complexity += 2 if re.search(r"\W", password) else 0

    return False if good_complexity > complexity else True
