from flask import render_template, abort

from server import SpotifyAuthorisationToken, spotify, db
from server.admin.forms import AddUserForm
from server.api.api_functions import update_user, modify_playlist_json, get_token_by_playlist
from server.main.modals import SpotifyUser, Playlist, User
from server.spotify.spotify import SpotifyError


def display_all_spotify_users():
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
            update_user(user_id, oauth_token)

        # Get information from the database and spotify and store it in the json
        user_json_list[spotify_user.spotify_user_id] = spotify.me(oauth_token)
        user_json_list[spotify_user.spotify_user_id]["playlist_count"] = Playlist.query.filter(
            Playlist.spotify_user == spotify_user.id).count()

    # Return the rendered template
    return render_template("spotify_users.html", spotify_users=user_json_list, title="Spotify Users")


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

    return render_template("users.html", title="Users", user_list=updated_user_list, form=form)


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
        return render_template("resource_not_found.html", title="404")

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
        update_user(user_id, oauth_token)

    # Build the playlist json by the requests to spotify
    playlist_list_json = {}
    for playlist in playlist_list:
        playlist_list_json[playlist.spotify_id] = modify_playlist_json(
            spotify.playlist(playlist.spotify_id, oauth_token))

    # Get the username of the spotify user
    user_name = spotify.me(oauth_token)['display_name']

    return render_template("spotify_user_playlists.html", playlist_list_json=playlist_list_json,
                           user_name=user_name, title=f"{user_name}'s Playlists")


def add_playlist_to_spotify_user(playlist_id: str):
    """
    Add a new spotify playlist to a user
    :param playlist_id: The playlist id
    :return: Status 400 or the playlist json
    """

    # Check if the playlist exists
    if Playlist.query.filter(Playlist.spotify_id == playlist_id).first():
        return abort(400, "The playlist does already exist")

    # Get a random spotify user for a auth token
    temp_user: SpotifyUser = SpotifyUser.query.first()
    auth_token = SpotifyAuthorisationToken(temp_user.refresh_token, temp_user.activated_at,
                                           temp_user.oauth_token)

    if auth_token.is_expired():
        auth_token = spotify.reauthorize(auth_token)
        user_id = spotify.me(auth_token)["id"]
        update_user(user_id, auth_token)

    # Check if the playlist id is valid
    try:
        playlist_json = spotify.playlist(playlist_id, auth_token)
    except SpotifyError as e:
        if "Invalid playlist Id" in str(e):
            return abort(400, "The Playlist ID you passed is not valid")

    # Get the owner of the playlist
    playlist_json_owner = playlist_json["owner"]["id"]

    # Get the owner of the playlist
    spotify_user_object: SpotifyUser = SpotifyUser.query.filter(
        SpotifyUser.spotify_user_id == playlist_json_owner).first()

    # Check if the owner is in the spotify user database
    if not spotify_user_object:
        return abort(400, f"The user ({playlist_json_owner}) the playlist belongs to does not exist in the tool. \n"
                          f"You have to create it manually.")

    # Create the playlist and add it to the database
    database_playlist = Playlist(spotify_id=playlist_id, spotify_user=spotify_user_object.id, users=[])
    db.session.add(database_playlist)
    db.session.commit()
    return playlist_json


def assign_playlists_to_user(playlist_list: list, user_id: str):
    """
    Assign a number of playlists to a user
    :param playlist_list: A list of playlist ids
    :param user_id: The user id the playlists should be added to
    :return: The status (200, 400) and the playlist json
    """

    # Get the user
    user: User = User.query.filter(User.id == user_id).first()

    if not user:
        return 400, "The user does not exist"

    # Get the json from the playlists which get added to the user
    playlist_json_list = []
    for playlist_id in playlist_list:
        playlist = Playlist.query.filter(Playlist.spotify_id == playlist_id).first()

        # Check if the playlist exists in the database
        if playlist:
            user.playlists.append(playlist)

            auth_token = get_token_by_playlist(playlist_id)

            if auth_token:
                # Append the information of the playlist ot the json
                playlist_json_list.append(modify_playlist_json(spotify.playlist(playlist_id, auth_token)))

    # Update commit the information to the database
    db.session.commit()
    return 200, playlist_json_list


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

        return render_template("edit_user.html", title="Edit Users", user=user, playlist_list=playlist_json,
                               all_playlists_list=all_playlists_list)
    else:
        return render_template("resource_not_found.html")
