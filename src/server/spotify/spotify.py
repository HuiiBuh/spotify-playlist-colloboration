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
    PLAYLIST_TRACKS = "https://api.spotify.com/v1/playlists/{playlist_id}/tracks"
    PLAYLIST = "https://api.spotify.com/v1/playlists/{playlist_id}"
    SEARCH = "https://api.spotify.com/v1/search?q={query}"


class SpotifyAppInfo:
    """
    A Class with only the application information in it
    """

    def __init__(self, application_id: str, application_secret: str, scopes: list, redirect_url: str, state: str):
        self.application_id = application_id
        self.application_secret = application_secret
        self.scopes = scopes
        self.redirect_url = redirect_url
        self.state = state


class SpotifyAuthorisationToken:
    """
    Class that has the Authorisation Token
    """

    def __init__(self, authorisation_token: str):
        """
        Generate a new authorisation token
        :param authorisation_token: The token
        """
        self._time: int = int(time.time())
        self.token: str = authorisation_token

    def is_expired(self) -> bool:
        """
        Checks if the api token has expired
        :return: bool
        """
        current_time: int = int(time.time())

        if current_time - self._time > 3600 * 59:
            return True

        return False


class SpotifyError(Exception):
    """
    Exception for invalid spotify return codes
    """
    pass


class Spotify:
    """
    A Spotify API manager class
    """

    def __init__(self):
        """
        New Spotify api manager
        """

        self.app_info: SpotifyAppInfo = None
        self._authorization_token: SpotifyAuthorisationToken = None

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

    def reauthorize(self) -> SpotifyAuthorisationToken:
        """
        Reauthorizes the app.
        Only works if the app has benn authorized before
        :return: None
        """

        if self.app_info is None:
            raise TypeError("The app info is None. You have to add this with the app_information property")

        if self._authorization_token is None:
            raise TypeError("You have to provide a AuthorisationToken object")

        url: str = SpotifyUrls.REFRESH

        body: dict = {
            "grant_type": "authorization_code",
            "code": self._authorization_token.token,
            "redirect_uri": self.app_info.redirect_url
        }

        auth_header: base64 = base64.b64encode(
            six.text_type(self.app_info.application_id + ':' + self.app_info.application_secret).encode('ascii'))
        headers: dict = {'Authorization': 'Basic %s' % auth_header.decode('ascii')}

        reauthorization_request = requests.post(url=url, data=body, headers=headers)

        if "error" in reauthorization_request.json():
            raise SpotifyError(f"There was an error: "
                               f"{reauthorization_request.json()}")

        try:
            access_token: str = reauthorization_request.json()["access_token"]
        except KeyError:
            raise SpotifyError(f"No 'access_token' key was found in this json:"
                               f"{reauthorization_request.json()}")
        # Update the access token
        auth_token: SpotifyAuthorisationToken = SpotifyAuthorisationToken(access_token)
        self.auth_token = auth_token
        return auth_token

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

    @property
    def auth_token(self) -> SpotifyAuthorisationToken:
        """
        Get the authorisation Token Object
        :return: The Authorisation Token
        """

        return self._authorization_token

    @auth_token.setter
    def auth_token(self, value: SpotifyAuthorisationToken) -> None:
        """
        Set a new authorisation token
        :param value: the authorisation token object
        :return: None
        """

        if not isinstance(value, SpotifyAuthorisationToken):
            raise TypeError("The value has to be a AuthorisationToken")
        self._authorization_token = value

    def playlist_tracks(self, playlist_id, **kwargs) -> json:
        """
        Get the songs of a playlist
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

        if self.auth_token is None:
            raise SpotifyError("You have to provide a valid auth token")

        if self.auth_token.is_expired():
            self.reauthorize()

        headers: dict = self._get_headers()
        request = requests.get(url=url, headers=headers)

        if "error" in request.json():
            raise SpotifyError(request.json())

        return request.json()

    def playlist(self, playlist_id, **kwargs) -> json:
        """
        Get the playlist
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

        if self.auth_token is None:
            raise SpotifyError("You have to provide a valid auth token")

        if self.auth_token.is_expired():
            self.reauthorize()

        headers: dict = self._get_headers()
        request = requests.get(url=url, headers=headers)

        if "error" in request.json():
            raise SpotifyError(request.json())

        return request.json()

    def search(self, query, **kwargs) -> json:
        """
        Search for things on spotify
        :param query: The search string
        :param kwargs: See https://developer.spotify.com/documentation/web-api/reference/search/search/
        :return: The json response of the api
        """

        url: str = SpotifyUrls.SEARCH.replace("{query}", query)

        # Add custom pararms to the url
        url_parameters = {}
        for kwarg in kwargs:
            url_parameters[kwarg] = kwargs[kwarg]

        if url_parameters != {}:
            url_parameters = urlencode(url_parameters)
            url += f"&{url_parameters}"

        if self.auth_token is None:
            raise SpotifyError("You have to provide a valid auth token")

        if self.auth_token.is_expired():
            self.reauthorize()

        headers: dict = self._get_headers()
        request = requests.get(url=url, headers=headers)

        if "error" in request.json():
            raise SpotifyError(request.json())

        return request.json()

    def add_songs_to_playlist(self, playlist_id: str, song_list: list, **kwargs) -> json:
        """
        Add songs to a specific playlist
        :param playlist_id: The id of the playlist
        :param song_list: The ids of the songs that are supposed to be added
        :param kwargs: See https://developer.spotify.com/documentation/web-api/reference/playlists/add-tracks-to-playlist/
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

        if self.auth_token is None:
            raise SpotifyError("You have to provide a valid auth token")

        if self.auth_token.is_expired():
            self.reauthorize()

        headers: dict = self._get_headers()
        request = requests.post(url=url, headers=headers)

        if "error" in request.json():
            raise SpotifyError(request.json())

        return request.json()

    def _get_headers(self) -> dict:
        """
        Get the headers required for OAuth
        :return: headers
        """

        if self.auth_token is None:
            raise SpotifyError("You have to provide a valid auth token")

        return {
            "Authorization": f"Bearer {self.auth_token.token}",
            "Content-Type": "application/json"
        }
