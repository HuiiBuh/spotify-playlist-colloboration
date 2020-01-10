from server import socket_io
from flask_socketio import Namespace, emit

from server.api.apis.updater import Updater
from server.main.modals import SpotifyUser


class Playback(Namespace):
    def __init__(self, namespace=None):
        super().__init__(namespace=None)
        self.connected: bool = False
        self.spotify_user_id = "Some very random string that is not a spotify ID."
        self.current_track: str = "Some very random string that is not a spotify ID."
        self.updater = None

    def on_connect(self):
        """
        Connect to the websocket
        :return: None
        """

        self.connected = True
        emit("connected", {"status": "connected"})

    def on_message_loop(self, msg):
        """
        Get info from cache db and return it
        :return: None
        """

        if self.detected_error(msg):
            return

        self.updater = Updater(self.spotify_user_id)

        while self.connected:
            socket_io.sleep(1)
            pass

    def detected_error(self, msg):
        if "spotify_user_id" not in msg:
            emit({"error": "No spotify_user_id was passed"})
            return True

        self.spotify_user_id = msg["spotify_user_id"]

        if not SpotifyUser.query.filter(SpotifyUser.spotify_user_id == self.spotify_user_id).first():
            emit({"error": "No spotify user with this id was found"})
            return True

        return False

    def on_error(self, _):
        """
        Stop the message loop during an error
        :param _: The error message
        :return: None
        """

        self.connected = False
        self.updater.remove_user(self.spotify_user_id)

    def on_disconnect(self, _):
        """
        Stop the message loop if the socket disconnects
        :param _: The disconnect message
        :return: None
        """

        self.connected = False
        self.updater.remove_user(self.spotify_user_id)


class Queue(Namespace):

    def __init__(self, namespace=None):
        super().__init__(namespace=None)
        self.connected = False

    def on_connect(self):
        """
        Connect to the websocket
        :return: None
        """

        self.connected = True
        emit("connected", {"status": "connected"})

    def on_update_queue(self):
        """
        Update the queue if new songs get added into it
        :return: None
        """

        while self.connected:
            socket_io.sleep(1)
            pass

    def on_error(self, _):
        """
        Stop the message loop during an error
        :param _: The error message
        :return: None
        """

        self.connected = False

    def on_disconnect(self, _):
        """
        Stop the message loop if the socket disconnects
        :param _: The disconnect message
        :return: None
        """

        self.connected = False
