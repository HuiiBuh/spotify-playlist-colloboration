from server import spotify
from server.api.api_functions import get_token_by_spotify_db_id
from server.main.modals import Song, Queue
from server.spotify import SpotifyAuthorisationToken
from server.spotify.spotify import SpotifyError


def update_spotify_queue(queue: Queue, auth_token: SpotifyAuthorisationToken = None,
                         remove_current: bool = False) -> str:
    """
    Update the spotify queue
    :param remove_current: Remove the current song
    :param queue: The queue
    :param auth_token: The auth token
    :return: "" if successful and error if not successful
    """

    # Get all songs that have not been played and create a song_id list
    song_list = Song.query.filter(Song.queue_id == queue.id and Song.playing is not False).all()
    song_id_list = []

    song: Song
    for song in song_list:
        song_id_list.append(song.spotify_id)

    print(song_id_list)

    # Get the auth token
    if not auth_token:
        auth_token = get_token_by_spotify_db_id(queue.spotify_user_db_id)

    # Queue the songs
    try:
        spotify.queue(track_id_list=song_id_list, auth_token=auth_token, shuffle=False, remove_current=remove_current)
    except SpotifyError as e:
        return str(e)
