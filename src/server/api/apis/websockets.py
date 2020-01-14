import functools
import json
import time
from abc import abstractmethod

from flask_login import current_user
from flask_socketio import Namespace, emit, disconnect, join_room

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
        self.user_information: list = []

        self.updater = None

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

        # Check if user exists
        for spotify_user in self.user_information:
            if spotify_user["spotify_id"] == msg["spotify_user_id"]:
                return False

        self.user_information.append({})
        self.user_information[-1]["spotify_id"] = msg["spotify_user_id"]
        self.user_information[-1]["current_song"] = "Lets see what you want to play"
        self.user_information[-1]["device"] = "Lets see what you want to play"
        self.user_information[-1]["last_update"] = 0
        self.user_information[-1]["song_count"] = -1
        self.user_information[-1]["db_id"] = SpotifyUser.query.filter(
            SpotifyUser.spotify_user_id == msg["spotify_user_id"]).first().id

        return False

    @authenticated_only
    def on_error(self, _):
        """
        Stop the message loop during an error
        :param _: The error message
        :return: None
        """

        # if self.updater:
        #     self.updater.remove_user(self.spotify_user_id)

    @authenticated_only
    def on_disconnect(self):
        """
        Stop the message loop if the socket disconnects
        :return: None
        """

        # if self.updater:
        #     self.updater.remove_user(self.spotify_user_id)

    @abstractmethod
    def __sync(self):
        raise NotImplementedError("You have to overwrite this method")


class WSPlayback(WS):

    def __init__(self, namespace: str):

        super().__init__(namespace=namespace)
        self.connected = False

    @authenticated_only
    def on_start_sync(self, msg):
        """
        Get info from db and return it
        :return: None
        """

        if self._detected_errors(msg):
            return

        self.updater = PlaybackUpdater(msg["spotify_user_id"])
        join_room(msg["spotify_user_id"])

        # Check if the sync has already been started once
        if not self.connected:
            self.connected = True
            socket_io.start_background_task(self.__sync())

    def __sync(self):
        """
        Start the syncing of the playback
        :return: None
        """

        while True:
            db.session.remove()
            for spotify_user in self.user_information:
                queue: Queue = Queue.query.filter(Queue.spotify_user_db_id == spotify_user["db_id"]).first()
                self._check_for_song_update(spotify_user, queue)
                self._check_for_song_update(spotify_user, queue)

            socket_io.sleep(1)

    @staticmethod
    def _check_for_song_update(spotify_user, queue: Queue):
        """
        Check if the current song should be updated
        :param spotify_user: The spotify user
        :param queue: The queue
        :return: None
        """

        current_song = json.loads(queue.current_song)
        if not current_song:
            # Check if the update has already been sent
            if spotify_user["current_song"]:
                emit('playback', {'song': None, "playing": False}, room=spotify_user["spotify_id"],
                     broadcast=True)
                spotify_user["current_song"] = ""
        else:
            emit('playback', {'song': current_song, "playing": True}, room=spotify_user["spotify_id"],
                 broadcast=True)
            spotify_user["current_song"] = current_song["item"]["id"]
            spotify_user["last_update"] = time.time()

    @staticmethod
    def _check_for_device_update(spotify_user, queue: Queue):
        """
        Send a device update if the devices change
        :param spotify_user: The spotify user
        :param queue: The queue
        :return: None
        """

        current_devices = json.loads(queue.devices)
        if not current_devices:
            # Check if the update has already been sent
            if spotify_user["device"]:
                emit("devices", None, room=spotify_user["spotify_id"], broadcast=True)
                spotify_user["device"] = ""
        else:
            # Check if the update has already been sent
            if spotify_user["device"] != current_devices:
                emit("devices", current_devices, room=spotify_user["spotify_id"], broadcast=True)
                spotify_user["device"] = queue.devices


class WSQueue(WS):

    def __init__(self, namespace: str):
        super().__init__(namespace=namespace)

        self.new_user = False
        self.connected = False

    @authenticated_only
    def on_update_queue(self, msg):
        """
        Update the queue if new songs get added into it
        :return: None
        """

        self.new_user = True
        if self._detected_errors(msg):
            return

        self.updater = QueueUpdater(msg["spotify_user_id"])
        join_room(msg["spotify_user_id"])

        spotify_user = SpotifyUser.query.filter(SpotifyUser.spotify_user_id == msg["spotify_user_id"]).first()
        queue: Queue = Queue.query.filter(Queue.spotify_user_db_id == spotify_user.id).first()
        song_list = Song.query.filter(Song.queue_id == queue.id).order_by(Song.id).all()
        emit("queue", self.build_queue(song_list))

        # Check if the sync has already been started once
        if not self.connected:
            self.connected = True
            socket_io.start_background_task(self.__sync())

    def __sync(self):

        while True:

            for spotify_user in self.user_information:

                db.session.remove()
                queue: Queue = Queue.query.filter(Queue.spotify_user_db_id == spotify_user["db_id"]).first()
                song_list = Song.query.filter(Song.queue_id == queue.id).order_by(Song.id).all()

                # Send a update if the current song changes
                current_song = json.loads(queue.current_song)
                if current_song:
                    if spotify_user["current_song"] != current_song["item"]["id"]:
                        spotify_user["current_song"] = current_song["item"]["id"]

                        self.update_current_track(spotify_user["db_id"])
                        emit("queue", self.build_queue(song_list), broadcast=True, room=spotify_user["spotify_id"])

                if spotify_user["song_count"] != len(song_list) or self.new_user:
                    self.new_user = False
                    emit("queue", self.build_queue(song_list), broadcast=True, room=spotify_user["spotify_id"])
                    spotify_user["song_count"] = len(song_list)

            socket_io.sleep(1)

    def update_current_track(self, spotify_user_db_id: str):
        queue: Queue = Queue.query.filter(Queue.spotify_user_db_id == spotify_user_db_id).first()

    @staticmethod
    def build_queue(song_list: list) -> dict:
        """
        Build the song queue that will be sent to the frontend
        :param song_list: THe song list in the db
        :return: The json song list
        """

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
