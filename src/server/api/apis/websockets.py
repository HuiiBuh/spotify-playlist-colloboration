import functools
import json

from flask_login import current_user

from server import socket_io, db
from flask_socketio import Namespace, emit, disconnect

from server.api.apis.playbackupdator import PlaybackUpdator
from server.main.modals import SpotifyUser, Queue


# ToDo in authenticated_only auch noch prüfen, ob der User playback beobachten darf

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


class WSPlayback(Namespace):
    def __init__(self, namespace=None):
        super().__init__(namespace=namespace)
        self.connected: bool = False

        self.spotify_user_id = "Some very random string that is not a spotify ID."
        self.spotify_db_user_id = "Some very random string that is not a spotify ID."

        self.current_track_id: str = "Some very random string that is not a spotify ID."
        self.current_device: str = "Some very random string..."
        self.updater = None

    @authenticated_only
    def on_connect(self):
        """
        Connect to the websocket
        :return: None
        """

        self.connected = True

    @authenticated_only
    def on_start_sync(self, msg):
        """
        Get info from db and return it
        :return: None
        """

        if self._detected_errors(msg):
            return

        self.updater = PlaybackUpdator(self.spotify_user_id)

        while self.connected:

            db.session.remove()
            queue: Queue = Queue.query.filter(Queue.spotify_user_id == self.spotify_db_user_id).first()

            # Send a update if the current song changes
            current_song = json.loads(queue.current_song)
            if not current_song:
                if self.current_track_id:
                    emit('playback', {'song': None, "playing": False})
                    self.current_track_id = ""
            else:
                if self.current_track_id != current_song["item"]["id"]:
                    emit('playback', {'song': current_song, "playing": True})
                    self.current_track_id = current_song["item"]["id"]

            # Send a update if the devices change
            current_devices = json.loads(queue.devices)
            if not current_devices:
                if self.current_device:
                    emit("devices", None)
                    self.current_device = ""
            else:
                if self.current_device != current_devices:
                    emit("devices", current_devices)
                    self.current_device = queue.devices

            socket_io.sleep(1)

    @authenticated_only
    def on_error(self, _):
        """
        Stop the message loop during an error
        :param _: The error message
        :return: None
        """

        self.connected = False
        if self.updater:
            self.updater.remove_user(self.spotify_user_id)

    @authenticated_only
    def on_disconnect(self):
        """
        Stop the message loop if the socket disconnects
        :return: None
        """

        self.connected = False
        if self.updater:
            self.updater.remove_user(self.spotify_user_id)

    def _detected_errors(self, msg) -> bool:
        """
        Detect any errors in the msg
        :param msg: The sent message
        :return: SpotifyUser
        """

        if "spotify_user_id" not in msg:
            emit({"error": "No spotify_user_id was passed"})
            return True

        if not SpotifyUser.query.filter(SpotifyUser.spotify_user_id == msg["spotify_user_id"]).first():
            emit({"error": "No spotify user with this id was found"})
            return True

        self.spotify_user_id = msg["spotify_user_id"]
        self.spotify_db_user_id = SpotifyUser.query.filter(
            SpotifyUser.spotify_user_id == self.spotify_user_id).first().id
        return False


class WSQueue(Namespace):

    def __init__(self, namespace=None):
        super().__init__(namespace=namespace)
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
