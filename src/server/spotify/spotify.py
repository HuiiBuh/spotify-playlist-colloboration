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
        self._token: str = authorisation_token

    def is_valid(self) -> bool:
        """
        Checks if the api token has expired
        :return: bool
        """
        current_time: int = int(time.time())

        if current_time - self._time > 3600 * 59:
            return False

        return True


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

    def reauthorize(self) -> bool:
        """
        Reauthorizes the app.
        Only works if the app has benn authorized before
        :return: Success or Not
        """

        if self.app_info is None:
            raise TypeError("The app info is None. You have to add this with the app_information property")

        if self._authorization_token is None:
            raise TypeError("You have to provide a AuthorisationToken object")

        url: str = SpotifyUrls.REFRESH

        body = {
            "grant_type": "authorization_code",
            "code": self._authorization_token._token,
            "redirect_uri": self.app_info.redirect_url
        }

        auth_header: base64 = base64.b64encode(
            six.text_type(self.app_info.application_id + ':' + self.app_info.application_secret).encode('ascii'))
        headers: dict = {'Authorization': 'Basic %s' % auth_header.decode('ascii')}

        reauthorization_request = requests.post(url=url, data=body, headers=headers)

        if reauthorization_request.status_code != 200:
            return False

        if not reauthorization_request.json():
            return False

        try:
            access_token: str = reauthorization_request.json()["access_token"]
        except KeyError:
            return False

        auth_token: SpotifyAuthorisationToken = SpotifyAuthorisationToken(access_token)
        self.auth_token = auth_token
        return True

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
