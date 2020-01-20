from server import spotify, db
from server.api.api_functions import get_token_by_spotify_db_id
from server.main.modals import Song
from server.spotify import SpotifyAuthorisationToken
from server.spotify.spotify import SpotifyError


def update_spotify_queue(queue_id: str = "",
                         spotify_user_db_id: str = None,
                         auth_token: SpotifyAuthorisationToken = None,
                         remove_current: bool = False) -> str:
    """
    Update the spotify queue
    :param spotify_user_db_id: The db id of a spotify user
    :param remove_current: Remove the current song
    :param queue_id: The queue id
    :param auth_token: The auth token
    :return: "" if successful and error if not successful
    """

    # Get all songs that have not been played and create a song_id list
    song_list = Song.query.filter(Song.queue_id == queue_id, Song.playing == False).all()
    song_id_list = []
    db.session.remove()

    song: Song
    for song in song_list:
        song_id_list.append(song.spotify_id)

    # Get the auth token
    if not auth_token:
        auth_token = get_token_by_spotify_db_id(spotify_user_db_id)

    # Queue the songs
    try:
        spotify.queue(track_id_list=song_id_list, auth_token=auth_token, shuffle=False, remove_current=remove_current)
    except SpotifyError as e:
        return str(e)
