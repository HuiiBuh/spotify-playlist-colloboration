import functools
import json

from flask_login import current_user
from flask_socketio import Namespace, emit, disconnect

from server import socket_io, db
from server.api.apis.updater import PlaybackUpdater, QueueUpdater
from server.main.modals import SpotifyUser, Queue, Song


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


class WS(Namespace):
    def __init__(self, namespace=None):
        super().__init__(namespace=namespace)
        self.current_device: str = "Some very random string..."
        self.queue_id: int = -1
        self.song_count: int = -1
        self.connected: bool = False

        self.spotify_user_id = "Some very random string that is not a spotify ID."
        self.spotify_user_db_id = "Some very random string that is not a spotify ID."
        self.current_track_id: str = "Some very random string that is not a spotify ID."

        self.updater = None

    @authenticated_only
    def on_connect(self):
        """
        Connect to the websocket
        :return: None
        """

        self.connected = True

    def _detected_errors(self, msg) -> bool:
        """
        Detect any errors in the msg
        :param msg: The sent message
        :return: SpotifyUser
        """

        if "spotify_user_id" not in msg:
            emit({"error": "No spotify_user_id was passed"}, broadcast=True)
            return True

        if not SpotifyUser.query.filter(SpotifyUser.spotify_user_id == msg["spotify_user_id"]).first():
            emit({"error": "No spotify user with this id was found"}, broadcast=True)
            return True

        self.spotify_user_id = msg["spotify_user_id"]
        self.spotify_user_db_id = SpotifyUser.query.filter(
            SpotifyUser.spotify_user_id == self.spotify_user_id).first().id
        return False

    @authenticated_only
    def on_error(self, _):
        """
        Stop the message loop during an error
        :param _: The error message
        :return: None
        """

        self.queue_id: int = -1
        self.song_count: int = -1
        self.connected: bool = False
        self.current_device: dict = {"Some very random string...": "string string"}

        self.spotify_user_id = "Some very random string that is not a spotify ID."
        self.spotify_user_db_id = "Some very random string that is not a spotify ID."
        self.current_track_id: str = "Some very random string that is not a spotify ID."

        self.updater = None
        if self.updater:
            self.updater.remove_user(self.spotify_user_id)

    @authenticated_only
    def on_disconnect(self):
        """
        Stop the message loop if the socket disconnects
        :return: None
        """

        self.queue_id: int = -1
        self.song_count: int = -1
        self.connected: bool = False
        self.current_device: str = "Some very random string..."

        self.spotify_user_id = "Some very random string that is not a spotify ID."
        self.spotify_user_db_id = "Some very random string that is not a spotify ID."
        self.current_track_id: str = "Some very random string that is not a spotify ID."

        self.updater = None

        if self.updater:
            self.updater.remove_user(self.spotify_user_id)


class WSPlayback(WS):

    @authenticated_only
    def on_start_sync(self, msg):
        """
        Get info from db and return it
        :return: None
        """

        if self._detected_errors(msg):
            return

        self.updater = PlaybackUpdater(self.spotify_user_id)
        socket_io.start_background_task(self.__sync())

    def __sync(self):
        while self.connected:

            db.session.remove()
            queue: Queue = Queue.query.filter(Queue.spotify_user_db_id == self.spotify_user_db_id).first()

            # Send a update if the current song changes
            current_song = json.loads(queue.current_song)
            if not current_song:
                if self.current_track_id:
                    emit('playback', {'song': None, "playing": False}, broadcast=True)
                    self.current_track_id = ""
            else:
                if self.current_track_id != current_song["item"]["id"]:
                    emit('playback', {'song': current_song, "playing": True}, broadcast=True)
                    self.current_track_id = current_song["item"]["id"]

            # Send a update if the devices change
            current_devices = json.loads(queue.devices)
            if current_devices:
                if self.current_device != current_devices:
                    emit("devices", current_devices, broadcast=True)
                    self.current_device = current_devices
            else:
                if self.current_device:
                    emit("devices", None, broadcast=True)
                    self.current_device = ""

            socket_io.sleep(1)


class WSQueue(WS):

    @authenticated_only
    def on_update_queue(self, msg):
        """
        Update the queue if new songs get added into it
        :return: None
        """
        if self._detected_errors(msg):
            return

        self.queue_id = Queue.query.filter(Queue.spotify_user_db_id == self.spotify_user_db_id).first().id

        self.updater = QueueUpdater(self.spotify_user_id)
        self.__sync()

    def __sync(self):

        while self.connected:

            db.session.remove()
            queue: Queue = Queue.query.filter(Queue.spotify_user_db_id == self.spotify_user_db_id).first()
            song_list = Song.query.filter(Song.queue_id == self.queue_id).order_by(Song.id).all()

            # Send a update if the current song changes
            current_song = json.loads(queue.current_song)
            if current_song:
                if self.current_track_id != current_song["item"]["id"]:
                    self.current_track_id = current_song["item"]["id"]

                    self.update_current_track()
                    emit("queue", self.build_queue(song_list), broadcast=True)

            print(self.song_count)
            print(len(song_list))

            if self.song_count != len(song_list):
                emit("queue", self.build_queue(song_list), broadcast=True)

                self.song_count = len(song_list)
            socket_io.sleep(1)

    def update_current_track(self):
        queue: Queue = Queue.query.filter(Queue.spotify_user_db_id == self.spotify_user_db_id).first()

    @staticmethod
    def build_queue(song_list: list) -> dict:

        queue_json = {
            "played": [],
            "playing": None,
            "queue": []
        }

        for song in song_list:
            if song.playing is False:
                queue_json["queue"].append(json.loads(song.song_info))
            elif song.playing is None:
                queue_json["played"].append(json.loads(song.song_info))
            elif song.playing is True:
                queue_json["playing"] = json.loads(song.song_info)

        return queue_json
