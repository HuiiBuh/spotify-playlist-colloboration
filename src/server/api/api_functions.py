import json

from flask import abort

from server import spotify, db
from server.main.modals import SpotifyUser, Playlist, User
from server.spotify.spotify import SpotifyError, SpotifyAuthorisationToken


def collect_tracks(playlist_id: str, auth_token: SpotifyAuthorisationToken, count=0, offset=0,
                   modified_tracks: dict = None) -> dict:
    """
    Collect the tracks from a playlist and recursively add them until every track in the playlist has been added
    :param playlist_id: The id of the playlist
    :param auth_token: The auth token used for the playlist
    :param count: The number of tracks already collected
    :param offset: At what track number should the request start
    :param modified_tracks: The already collected tracks
    :return: The dict with all the songs
    """

    if modified_tracks is None:
        modified_tracks = {}

    # Get the tracks from the playlist with a offset
    tracks = spotify.playlist_tracks(playlist_id=playlist_id, auth_token=auth_token, offset=offset)

    # Get the length of all the songs
    count += len(tracks["items"])

    # Get the modified tracks
    modified_tracks: dict = modify_track_json(tracks, return_track_list=modified_tracks)

    # Check if there are still unprocessed tracks
    if tracks["total"] > count:
        collect_tracks(playlist_id, auth_token, count=count, offset=(count - 1), modified_tracks=modified_tracks)

    return modified_tracks


def assign_playlists_to_user(playlist_list: list, user_id: str) -> tuple:
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


def add_playlist_to_spotify_user(playlist_id: str, spotify_user_id: str, song_length: int):
    """
    Add a new spotify playlist to a user
    :param song_length: The max song length
    :param spotify_user_id: The spotify user id of the playlist owner
    :param playlist_id: The playlist id
    :return: Status 400 or the playlist json
    """

    # Check if the playlist exists
    if Playlist.query.filter(Playlist.spotify_id == playlist_id).first():
        return abort(400, "The playlist does already exist")

    # Get a random spotify user for a auth token
    temp_user: SpotifyUser = SpotifyUser.query.filter(SpotifyUser.spotify_user_id == spotify_user_id).first()
    auth_token = SpotifyAuthorisationToken(temp_user.refresh_token, temp_user.activated_at,
                                           temp_user.oauth_token)

    if auth_token.is_expired():
        auth_token = spotify.reauthorize(auth_token)
        user_id = spotify.me(auth_token)["id"]
        update_spotify_user(user_id, auth_token)

    # Check if the playlist id is valid
    playlist_json = {}
    try:
        playlist_json = spotify.playlist(playlist_id, auth_token)
        playlist_json["duration"] = song_length

    except SpotifyError as e:
        return return_error(e)

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
    database_playlist = Playlist(spotify_id=playlist_id, spotify_user=spotify_user_object.id, users=[],
                                 max_song_length=song_length)
    db.session.add(database_playlist)
    db.session.commit()
    return playlist_json


def get_token_by_playlist(playlist_id: str) -> SpotifyAuthorisationToken:
    """
    Takes the playlist id and gets the valid token for the playlist
    :param playlist_id: The id of the playlist
    :return: A valid and reauthorized token
    """

    playlist: Playlist = Playlist.query.filter(Playlist.spotify_id == playlist_id).first()
    if not playlist:
        return None

    spotify_user = SpotifyUser.query.filter(SpotifyUser.id == playlist.spotify_user).first()
    if not spotify_user:
        return None

    auth_token = SpotifyAuthorisationToken(refresh_token=spotify_user.refresh_token,
                                           authorisation_token=spotify_user.oauth_token,
                                           activation_time=spotify_user.activated_at)
    if auth_token.is_expired():
        auth_token = spotify.reauthorize(auth_token)
        user_id = spotify.me(auth_token)["id"]
        update_spotify_user(user_id, auth_token)

    return auth_token


def get_token_by_spotify_user_id(spotify_user_id: str) -> SpotifyAuthorisationToken:
    """

    :param spotify_user_id:
    :return:
    """

    spotify_user = SpotifyUser.query.filter(SpotifyUser.spotify_user_id == spotify_user_id).first()
    if not spotify_user:
        return None

    auth_token = SpotifyAuthorisationToken(refresh_token=spotify_user.refresh_token,
                                           authorisation_token=spotify_user.oauth_token,
                                           activation_time=spotify_user.activated_at)
    if auth_token.is_expired():
        auth_token = spotify.reauthorize(auth_token)
        user_id = spotify.me(auth_token)["id"]
        update_spotify_user(user_id, auth_token)

    return auth_token


def update_spotify_user(user_id: str, auth_token: SpotifyAuthorisationToken) -> None:
    """
    Updates/creates the user with a token
    :param user_id: The spotify user id
    :param auth_token: The token of the user
    :return: None
    """

    # Get the current spotify user
    spotify_user: SpotifyUser = SpotifyUser.query.filter(SpotifyUser.spotify_user_id == user_id).first()

    # Create a spotify user if the user does not exist
    if not spotify_user:
        spotify_user = SpotifyUser(spotify_user_id=user_id,
                                   oauth_token=auth_token.token,
                                   activated_at=auth_token.activation_time,
                                   refresh_token=auth_token.refresh_token)
        db.session.add(spotify_user)
        db.session.commit()
        return

    # Set the tokens for the user
    spotify_user.oauth_token = auth_token.token
    spotify_user.refresh_token = auth_token.refresh_token
    spotify_user.activated_at = auth_token.activation_time
    db.session.commit()


def modify_track_json(track_list: dict, return_track_list=None) -> dict:
    """
    Modify the track list so there is less information stored in it
    :param track_list: The List of tracks received from the spotify api
    :param return_track_list: A already modified list (optional)
    :return: The modified track list
    """

    # Check if the return list is existent
    if return_track_list is None:
        return_track_list = {}

    # Get the actual tracks
    track_list = track_list["items"]

    # Iterate over every track and extract the relevant information
    for track in track_list:

        if "track" in track:
            track = track["track"]

        return_track_list[track["id"]] = {}

        return_track_list[track["id"]]["title"] = track["name"]

        return_track_list[track["id"]]["album"] = {}
        return_track_list[track["id"]]["album"]["name"] = track["album"]["name"]
        return_track_list[track["id"]]["album"]["url"] = track["album"]["external_urls"]["spotify"]
        return_track_list[track["id"]]["album"]["artist"] = {}
        return_track_list[track["id"]]["album"]["artist"]["name"] = track["album"]["artists"][0]["name"]
        return_track_list[track["id"]]["album"]["artist"]["url"] = track["album"]["artists"][0]["external_urls"][
            "spotify"]

        return_track_list[track["id"]]["cover"] = track["album"]["images"][1]["url"]

        return_track_list[track["id"]]["url"] = track["external_urls"]["spotify"]

        return_track_list[track["id"]]["duration"] = track["duration_ms"]

        artist_list = track["artists"]
        return_track_list[track["id"]]["artists"] = []
        for artist in artist_list:
            artist_json = {
                "name": artist["name"],
                "url": artist["external_urls"]["spotify"]
            }

            return_track_list[track["id"]]["artists"].append(artist_json)

    return return_track_list


def modify_playlist_json(playlist_json: dict) -> dict:
    """
    Modify the playlist json so only relevant information is transmited
    :param playlist_json: The playlist json from the spotify api
    :return: The modified playlist json
    """
    return_playlist = {
        "name": playlist_json["name"],
        "author": {
            "name": playlist_json["owner"]["display_name"],
            "url": playlist_json["owner"]["external_urls"]["spotify"]
        },
        "url": playlist_json["external_urls"]["spotify"],
        "track_count": playlist_json["tracks"]["total"],
        "id": playlist_json["id"]
    }
    # Replace the playlist image with a own image if no image is set
    try:
        return_playlist["image_url"] = playlist_json["images"][0]["url"]
    except IndexError:
        return_playlist["image_url"] = "/static/icons/default_playlist_cover.png"

    return return_playlist


def check_songs(song_list: list, auth_token: SpotifyAuthorisationToken, playlist_id):
    """
    Check if the songs are to long
    :param playlist_id: The playlist id the songs should be added to
    :param auth_token: The auth
    :param song_list: A list of song ids
    :return:
    """

    playlist = Playlist.query.filter(Playlist.spotify_id == playlist_id)
    if not playlist:
        return []

    p_duration = playlist.first().max_song_length
    if p_duration == 0:
        return song_list

    updated_track_list = []

    for track_id in song_list:
        try:
            s_duration = int(spotify.track(track_id, auth_token)["duration_ms"])
            if not p_duration * 1000 < s_duration:
                updated_track_list.append(track_id)
        except SpotifyError:
            pass

    return updated_track_list


def return_error(spotify_error: SpotifyError):
    """
    Takes a spotify error and returns the right api response
    :param spotify_error: The spotify error
    :return: Api response
    """

    spotify_error: json = json.loads(str(spotify_error))

    status = spotify_error["error"]["status"]
    message = str(status) + ": " + spotify_error["error"]["message"]
    return message, status
