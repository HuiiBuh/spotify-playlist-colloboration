from server import socket_io
from flask_socketio import Namespace, emit


class Playback(Namespace):
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

    def on_message_loop(self):
        """
        Get info from cache db and return it
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
