import functools

from flask_login import current_user

from server import socket_io
from flask_socketio import Namespace, emit, disconnect, send

from server.api.apis.updater import Updater
from server.main.modals import SpotifyUser


def authenticated_only(f):
    """
    Allow only authenticated users to connect
    :param f: The function
    :return: The wrapped function
    """

    @functools.wraps(f)
    def wrapped(*args, **kwargs):
        if not current_user.is_authenticated:
            disconnect()
        else:
            return f(*args, **kwargs)

    return wrapped


class Playback(Namespace):
    def __init__(self, namespace=None):
        super().__init__(namespace=None)
        # self.connected: bool = False
        self.spotify_user_id = "Some very random string that is not a spotify ID."
        self.current_track: str = "Some very random string that is not a spotify ID."
        self.updater = None

    # @authenticated_only
    def on_connect(self):
        """
        Connect to the websocket
        :return: None
        """

        # self.connected = True
        send('connect')

    # @authenticated_only
    def on_essen(self, msg):
        """
        Get info from db and return it
        :return: None
        """

        if self._detected_errors(msg):
            return

        self.updater = Updater(self.spotify_user_id)

        # while self.connected:
        #     socket_io.sleep(1)
        #     emit('message', {'data': 'Message'})

    # @authenticated_only
    def on_error(self, _):
        """
        Stop the message loop during an error
        :param _: The error message
        :return: None
        """

        # self.connected = False

        if self.updater:
            self.updater.remove_user(self.spotify_user_id)

    # @authenticated_only
    def on_disconnect(self):
        """
        Stop the message loop if the socket disconnects
        :return: None
        """

        # self.connected = False
        if self.updater:
            self.updater.remove_user(self.spotify_user_id)

    def _detected_errors(self, msg):
        """
        Detect any errors in the msg
        :param msg: The sent message
        :return: None
        """

        if "spotify_user_id" not in msg:
            emit({"error": "No spotify_user_id was passed"})
            return True

        if not SpotifyUser.query.filter(SpotifyUser.spotify_user_id == msg["spotify_user_id"]).first():
            emit({"error": "No spotify user with this id was found"})
            return True

        self.spotify_user_id = msg["spotify_user_id"]
        return False


class Queue(Namespace):

    def __init__(self, namespace=None):
        super().__init__(namespace=None)
        self.connected = False

    @authenticated_only
    def on_connect(self):
        """
        Connect to the websocket
        :return: None
        """

        self.connected = True
        emit("connected", {"status": "connected"})

    @authenticated_only
    def on_update_queue(self):
        """
        Update the queue if new songs get added into it
        :return: None
        """

        while self.connected:
            socket_io.sleep(1)
            pass

    @authenticated_only
    def on_error(self, _):
        """
        Stop the message loop during an error
        :param _: The error message
        :return: None
        """

        self.connected = False

    @authenticated_only
    def on_disconnect(self, _):
        """
        Stop the message loop if the socket disconnects
        :param _: The disconnect message
        :return: None
        """

        self.connected = False
