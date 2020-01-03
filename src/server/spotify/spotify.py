"""
Spotify Api Module
"""
import base64
import json
import time
from urllib.parse import urlencode

import requests
import six


class SpotifyUrls:
    """
    Class with all the spotify api urls
    """
    AUTHORIZE = "https://accounts.spotify.com/authorize"
    REFRESH = "https://accounts.spotify.com/api/token"
    TRACK = "https://api.spotify.com/v1/tracks/{id}"
    PLAYLIST_TRACKS = "https://api.spotify.com/v1/playlists/{playlist_id}/tracks"
    PLAYLIST = "https://api.spotify.com/v1/playlists/{playlist_id}"
    SEARCH = "https://api.spotify.com/v1/search?q={query}"
    ME = "https://api.spotify.com/v1/me"
    ME_PLAYLISTS = "https://api.spotify.com/v1/me/playlists"
    DEVICES = "https://api.spotify.com/v1/me/player/devices"
    CURRENT_PLAYBACK = "https://api.spotify.com/v1/me/player"
    PLAY = "https://api.spotify.com/v1/me/player/play"
    SHUFFLE = "https://api.spotify.com/v1/me/player/shuffle"


class SpotifyAppInfo:
    """
    A Class with only the application information in it
    """

    def __init__(self, application_id: str, application_secret: str, scopes: list, redirect_url: str, state: str):
        self.application_id: str = application_id
        self.application_secret: str = application_secret
        self.scopes: list = scopes
        self.redirect_url: str = redirect_url
        self.state: str = state


class SpotifyAuthorisationToken:
    """
    Class that has the Authorisation Token
    """

    def __init__(self, refresh_token: str, activation_time: int, authorisation_token=None):
        """
        Generate a new authorisation token
        :param refresh_token: The refresh token that was given to the application
        :param authorisation_token: The token
        """
        self.activation_time: int = activation_time
        self.refresh_token = refresh_token
        self.token: str = authorisation_token

    def is_expired(self) -> bool:
        """
        Checks if the api token has expired
        :return: bool
        """
        current_time: int = int(time.time())

        # Check if token is valid (3600 would be correct, but a bit of time padding is always nice)
        if current_time - self.activation_time > 3400:
            return True

        return False


class SpotifyError(Exception):
    """
    Exception for invalid spotify return codes
    """
    pass


class Spotify:
    """
    A Spotify API manager
    """

    def __init__(self):
        """
        New Spotify api manager
        """

        self.app_info: SpotifyAppInfo = None

    def build_authorize_url(self, show_dialog=True) -> str:
        """
        Builds the URL for the authorisation
        :param show_dialog: Is the dialog supposed to be shown
        :return:
        """

        if self.app_info is None:
            raise TypeError("The app info is None. You have to add this with the app_information property")

        params = {
            "client_id": self.app_info.application_id,
            "response_type": "code",
            "scope": ' '.join(self.app_info.scopes),
            "show_dialog": json.dumps(show_dialog),
        }

        params = urlencode(params)
        url: str = f"{SpotifyUrls.AUTHORIZE}" \
                   f"?redirect_uri={self.app_info.redirect_url}" \
                   f"&{params}" \
                   f"&state={self.app_info.state}"
        return url

    def reauthorize(self, spotify_auth_token: SpotifyAuthorisationToken,
                    grant_type="refresh_token") -> SpotifyAuthorisationToken:
        """
        Reauthorizes the token and returns the reauthorized token.
        Only works if the app has benn authorized before
        :param grant_type: If the token is to be refreshed, or authorization_code
        :param spotify_auth_token A valid SpotifyAuthorisationToken
        :return: Reauthorized SpotifyAuthorisationToken
        """

        if self.app_info is None:
            raise TypeError("The app info is None. You have to add this with the app_information property")

        if spotify_auth_token is None:
            raise TypeError("You have to provide a AuthorisationToken object")

        url: str = SpotifyUrls.REFRESH

        body: dict = {
            "grant_type": grant_type,
        }

        if grant_type == "refresh_token":
            body["refresh_token"] = spotify_auth_token.refresh_token

        if grant_type == "authorization_code":
            body["code"] = spotify_auth_token.refresh_token
            body["redirect_uri"] = self.app_info.redirect_url

        auth_header: base64 = base64.b64encode(
            six.text_type(self.app_info.application_id + ':' + self.app_info.application_secret).encode('ascii'))
        headers: dict = {'Authorization': 'Basic %s' % auth_header.decode('ascii')}

        reauthorization_request = requests.post(url=url, data=body, headers=headers)

        if "error" in reauthorization_request.json():
            raise SpotifyError(f"There was an error: {reauthorization_request.json()}")

        try:
            access_token: str = reauthorization_request.json()["access_token"]
        except KeyError:
            raise SpotifyError(f"No 'access_token' key was found in this json:"
                               f"{reauthorization_request.json()}")
        try:
            refresh_token: str = reauthorization_request.json()["refresh_token"]
        except KeyError:
            refresh_token = spotify_auth_token.refresh_token

        # Update the access token
        return SpotifyAuthorisationToken(refresh_token=refresh_token,
                                         authorisation_token=access_token,
                                         activation_time=int(time.time()))

    @property
    def app_information(self) -> SpotifyAppInfo:
        """
        Get the config/infos of the app
        :return: The SpotifyAppInfo Object
        """

        return self.app_info

    @app_information.setter
    def app_information(self, value: SpotifyAppInfo) -> None:
        """
        Set the Global config/infos of the app
        :param value: A Instance of the SpotifyAppInfo class
        :return: None
        """

        if not isinstance(value, SpotifyAppInfo):
            raise TypeError("The value has to be a SpotifyAppInfo")

        self.app_info = value

    def playlist_tracks(self, playlist_id: str, auth_token: SpotifyAuthorisationToken, **kwargs: str) -> json:
        """
        Get the songs of a playlist
        :param auth_token: Valid SpotifyAuthorisationToken
        :param playlist_id: the id of the playlist
        :param kwargs: See https://developer.spotify.com/documentation/web-api/reference/playlists/get-playlists-tracks/
        :return: playlist json
        """

        url: str = SpotifyUrls.PLAYLIST_TRACKS.replace("{playlist_id}", playlist_id)

        # Add custom pararms to the url
        url_parameters = {}
        for kwarg in kwargs:
            url_parameters[kwarg] = kwargs[kwarg]

        if url_parameters != {}:
            url_parameters = urlencode(url_parameters)
            url += f"?{url_parameters}"

        if auth_token is None:
            raise SpotifyError("You have to provide a valid auth token")

        headers: dict = self._get_headers(auth_token)
        request = requests.get(url=url, headers=headers)

        if "error" in request.json():
            raise SpotifyError(request.json())

        return request.json()

    def playlist(self, playlist_id: str, auth_token: SpotifyAuthorisationToken, **kwargs: str) -> json:
        """
        Get the playlist
        :param auth_token: Valid SpotifyAuthorisationToken
        :param playlist_id: The id of the playlist
        :param kwargs: See https://developer.spotify.com/documentation/web-api/reference/playlists/get-playlist/
        :return: The json of the playlist
        """

        url: str = SpotifyUrls.PLAYLIST.replace("{playlist_id}", playlist_id)

        # Add custom pararms to the url
        url_parameters = {}
        for kwarg in kwargs:
            url_parameters[kwarg] = kwargs[kwarg]

        if url_parameters != {}:
            url_parameters = urlencode(url_parameters)
            url += f"?{url_parameters}"

        if auth_token is None:
            raise SpotifyError("You have to provide a valid auth token")

        headers: dict = self._get_headers(auth_token)
        request = requests.get(url=url, headers=headers)

        if "error" in request.json():
            raise SpotifyError(request.json())

        return request.json()

    def search(self, query: str, search_type: str, auth_token: SpotifyAuthorisationToken, **kwargs: str) -> json:
        """
        Search for things on spotify
        :param auth_token: Valid SpotifyAuthorisationToken
        :param query: The search string4
        :param search_type: The type of the search result (song, artist, playlist, album)
        :param kwargs: See https://developer.spotify.com/documentation/web-api/reference/search/search/
        :return: The json response of the api
        """

        url: str = SpotifyUrls.SEARCH.replace("{query}", query)
        url += f"&type={search_type}"

        # Add custom pararms to the url
        url_parameters = {}
        for kwarg in kwargs:
            url_parameters[kwarg] = kwargs[kwarg]

        if url_parameters != {}:
            url_parameters = urlencode(url_parameters)
            url += f"&{url_parameters}"

        if auth_token is None:
            raise SpotifyError("You have to provide a valid auth token")

        headers: dict = self._get_headers(auth_token)
        request = requests.get(url=url, headers=headers)

        if "error" in request.json():
            raise SpotifyError(request.json())

        return request.json()

    def add_playlist_tracks(self, playlist_id: str, song_list: list, auth_token: SpotifyAuthorisationToken,
                            **kwargs) -> json:
        """
        Add songs to a specific playlist
        :param auth_token: Valid SpotifyAuthorisationToken
        :param playlist_id: The id of the playlist
        :param song_list: The ids of the songs that are supposed to be added
        :param kwargs: See http://developer.spotify.com/documentation/web-api/reference/playlists/add-tracks-to-playlist
        :return: snapshot_id
        """

        url: str = SpotifyUrls.PLAYLIST_TRACKS.replace("{playlist_id}", playlist_id)

        # Build post body
        uris: str = ""
        for song_id in song_list:
            uris += f"spotify:track:{song_id},"

            # Remove the last comma
            if song_list.index(song_id) >= len(song_list) - 1:
                uris = uris[:len(uris) - 1]

        url += f"?uris={uris}"

        # Add custom pararms to the url
        url_parameters = {}
        for kwarg in kwargs:
            url_parameters[kwarg] = kwargs[kwarg]

        if url_parameters != {}:
            url_parameters = urlencode(url_parameters)
            url += f"&{url_parameters}"

        if auth_token is None:
            raise SpotifyError("You have to provide a valid auth token")

        headers: dict = self._get_headers(auth_token)
        request = requests.post(url=url, headers=headers)

        if "error" in request.json():
            raise SpotifyError(request.json())

        return request.json()

    def me(self, auth_token: SpotifyAuthorisationToken, filter_email=True) -> json:
        """
        Get the user of the current token in use
        :param auth_token: Valid SpotifyAuthorisationToken
        :param filter_email: Removes the email from the json
        :return: The json
        """
        url: str = SpotifyUrls.ME

        if auth_token is None:
            raise SpotifyError("You have to provide a valid auth token")

        headers: dict = self._get_headers(auth_token)
        request = requests.get(url=url, headers=headers)

        if "error" in request.json():
            raise SpotifyError(request.json())

        request_json = request.json()

        if filter_email:
            request_json["email"] = "***censored***"

        return request_json

    def user_playlists(self, auth_token: SpotifyAuthorisationToken) -> dict:

        url: str = SpotifyUrls.ME_PLAYLISTS

        if auth_token is None:
            raise SpotifyError("You have to provide a valid auth token")

        headers: dict = self._get_headers(auth_token)
        request = requests.get(url=url, headers=headers)

        if "error" in request.json():
            raise SpotifyError(request.json())

        return request.json()

    def track(self, track_id: str, auth_token: SpotifyAuthorisationToken) -> dict:
        """
        Get the track information
        :param track_id: The spotify track id
        :param auth_token: A valid auth token
        :return: The information available to the track
        """

        url: str = SpotifyUrls.TRACK.replace("{id}", track_id)

        if auth_token is None:
            raise SpotifyError("You have to provide a valid auth token")

        headers: dict = self._get_headers(auth_token)
        request = requests.get(url=url, headers=headers)

        if "error" in request.json():
            raise SpotifyError(request.json())

        return request.json()

    def current_playback(self, auth_token: SpotifyAuthorisationToken) -> dict:
        """
        Get the current playback
        :param auth_token: The auth token
        :return: The current playback information
        """

        request = requests.get(SpotifyUrls.CURRENT_PLAYBACK, headers=self._get_headers(auth_token))

        if request.text:
            if "error" in request.json():
                raise SpotifyError(request.json())
            return request.json()
        return {}

    def devices(self, auth_token: SpotifyAuthorisationToken) -> dict:
        """
        Get all possible devices connected to spotify
        :param auth_token: The auth token
        :return: The api response
        """

        url = SpotifyUrls.DEVICES

        request = requests.get(url=url, headers=self._get_headers(auth_token))

        if request.text and "error" in request.json():
            raise SpotifyError(request.json())

        return request.json()

    def shuffle(self, shuffle_on: bool, auth_token: SpotifyAuthorisationToken) -> bool:
        """
        Set the shuffle to a specific value
        :param shuffle_on: Is the shuffle supposed to be on
        :param auth_token: The auth token
        :return: The shuffle state
        """

        url = SpotifyUrls.SHUFFLE
        url += f"?state={shuffle_on}"

        request = requests.put(url=url, headers=self._get_headers(auth_token))

        if request.text and "error" in request.json():
            raise SpotifyError(request.json())

        return shuffle_on

    def queue(self, track_id_list: list, auth_token: SpotifyAuthorisationToken, shuffle: bool = None) -> dict:
        """
        Queue a track
        :param shuffle: The shuffle state
        :param track_id_list: The id of the track
        :param auth_token: The auth token
        :return: If it was a success or not
        """

        # Get the currently playing track
        current = self.current_playback(auth_token)
        if not current:
            return {"error": "No playback device was found"}

        # Set shuffle to the current value
        if shuffle is not None:
            self.shuffle(shuffle, auth_token)

        # Get the current song id and the progress
        current_song = current["item"]["uri"]
        progress = current["progress_ms"]

        body: json = {
            "uris": [
                current_song
            ],
            "position_ms": progress
        }

        # Add the tracks to the queue
        for track_id in track_id_list:
            body["uris"].append(f"spotify:track:{track_id}")

        request = requests.put(SpotifyUrls.PLAY, headers=self._get_headers(auth_token), data=json.dumps(body))

        if request.text and "error" in request.json():
            raise SpotifyError(request.json())

        return {"success": "success"}

    @staticmethod
    def _get_headers(auth_token: SpotifyAuthorisationToken) -> dict:
        """
        Get the headers required for OAuth
        :type auth_token: Valid SpotifyAuthorisationToken
        :return: headers
        """

        if auth_token is None:
            raise SpotifyError("You have to provide a valid auth token")

        return {
            "Authorization": f"Bearer {auth_token.token}",
            "Content-Type": "application/json"
        }
