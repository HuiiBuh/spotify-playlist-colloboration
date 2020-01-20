import functools
import json
from abc import abstractmethod

from flask import request
from flask_login import current_user
from flask_socketio import Namespace, emit, disconnect, join_room

from server import socket_io, db
from server.api.apis.playback_functions import update_spotify_queue
from server.api.apis.updater import PlaybackUpdater
from server.main.modals import SpotifyUser, Queue, Song


class UserInformation:
    def __init__(self, spotify_id: str, session_id: str):
        self.spotify_id: str = spotify_id
        self.db_id: str = SpotifyUser.query.filter(SpotifyUser.spotify_user_id == spotify_id).first().id
        self.current_song: str = "current_song"
        self.device: str = "device"
        self.song_count: int = -1
        self.session_list: list = [session_id]
        self.new_user: bool = True


# ToDo in authenticated_only auch noch prüfen, ob der User playback beobachten darf
# ToDO check if spotify use has a queue
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
        self.connected = False
        self.user_information: list = []

        self.updater = None

    def _prepare_data(self, msg) -> bool:
        """
        Detect any errors in the msg
        :param msg: The sent message
        :return: SpotifyUser
        """

        # Check if the spotify id is present
        if "spotify_user_id" not in msg:
            emit({"error": "No spotify_user_id was passed"}, broadcast=True)
            return True

        # Check if the spotify user exists
        if not SpotifyUser.query.filter(SpotifyUser.spotify_user_id == msg["spotify_user_id"]).first():
            emit({"error": "No spotify user with this id was found"}, broadcast=True)
            return True

        # Check if user exists
        webapp_user: UserInformation
        for webapp_user in self.user_information:
            if webapp_user.spotify_id == msg["spotify_user_id"]:
                # Update the user ids
                try:
                    webapp_user.session_list.append(request.cookies["io"])
                except KeyError:
                    webapp_user.session_list.append("unknown_user")
                webapp_user.new_user = True
                return False
        try:
            user_information = UserInformation(msg["spotify_user_id"], request.cookies["io"])
        except KeyError:
            user_information = UserInformation(msg["spotify_user_id"], "unknown_user")
        self.user_information.append(user_information)

        return False

    @authenticated_only
    def on_error(self, _):
        """
        Stop the message loop during an error
        :return: None
        """
        self.remove_session()

    @authenticated_only
    def on_disconnect(self):
        """
        Stop the message loop if the socket disconnects
        :return: None
        """

        self.remove_session()

    def remove_session(self):
        try:
            message_id = request.cookies["io"]
        except KeyError:
            message_id = "unknown_user"

        webapp_user: UserInformation
        for webapp_user in self.user_information:
            if message_id in webapp_user.session_list:
                webapp_user.session_list.remove(message_id)

            # Check if there is still a user in the webapp otherwise remove the spotify user
            if not webapp_user.session_list:
                if self.updater:
                    self.updater.remove_user(webapp_user.spotify_id)

        if not self.user_information:
            self.connected = False

    @abstractmethod
    def __sync(self):
        raise NotImplementedError("You have to overwrite this method")


class WSPlayback(WS):

    def __init__(self, namespace: str):

        super().__init__(namespace=namespace)

    @authenticated_only
    def on_start_sync(self, msg):
        """
        Get info from db and return it
        :return: None
        """

        if self._prepare_data(msg):
            return

        self.updater = PlaybackUpdater(msg["spotify_user_id"])
        join_room(msg["spotify_user_id"])

        spotify_user: SpotifyUser = SpotifyUser.query.filter(
            SpotifyUser.spotify_user_id == msg["spotify_user_id"]).first()
        queue: Queue = Queue.query.filter(Queue.spotify_user_db_id == spotify_user.id).first()
        emit("device", json.loads(queue.devices))

        # Check if the sync has already been started once
        if not self.connected:
            self.connected = True
            socket_io.start_background_task(self.__sync())

    def __sync(self):
        """
        Start the syncing of the playback
        :return: None
        """

        while self.connected:
            db.session.remove()

            spotify_user: UserInformation
            for spotify_user in self.user_information:
                queue: Queue = Queue.query.filter(Queue.spotify_user_db_id == spotify_user.db_id).first()
                self._check_for_song_update(spotify_user, queue)
                self._check_for_device_update(spotify_user, queue)

            socket_io.sleep(1)

    @staticmethod
    def _check_for_song_update(spotify_user: UserInformation, queue: Queue):
        """
        Check if the current song should be updated
        :param spotify_user: The spotify user
        :param queue: The queue
        :return: None
        """

        current_song = json.loads(queue.current_song)

        if not current_song:
            # Check if the update has already been sent
            if spotify_user.current_song or spotify_user.new_user:
                emit('playback', {'song': None, "playing": False}, room=spotify_user.spotify_id,
                     broadcast=True)
                spotify_user.current_song = ""
        else:
            emit('playback', {'song': current_song, "playing": True}, room=spotify_user.spotify_id,
                 broadcast=True)
            try:
                spotify_user.current_song = current_song["item"]["id"]
            except TypeError:
                pass

    @staticmethod
    def _check_for_device_update(spotify_user: UserInformation, queue: Queue):
        """
        Send a device update if the devices change
        :param spotify_user: The spotify user
        :param queue: The queue
        :return: None
        """

        current_devices = json.loads(queue.devices)
        # Check if the update has already been sent
        if spotify_user.device != current_devices or spotify_user.new_user:
            emit("devices", current_devices, room=spotify_user.spotify_id, broadcast=True)
            spotify_user.new_user = False
            spotify_user.device = current_devices


class WSQueue(WS):

    def __init__(self, namespace: str):
        super().__init__(namespace=namespace)

    @authenticated_only
    def on_update_queue(self, msg):
        """
        Update the queue if new songs get added into it
        :return: None
        """

        if self._prepare_data(msg):
            return

        join_room(msg["spotify_user_id"])

        spotify_user: SpotifyUser = SpotifyUser.query.filter(
            SpotifyUser.spotify_user_id == msg["spotify_user_id"]).first()

        queue: Queue = Queue.query.filter(Queue.spotify_user_db_id == spotify_user.id).first()

        # Get all songs in a queue and send the queue to the new user
        song_list = Song.query.filter(Song.queue_id == queue.id).order_by(Song.id).all()
        emit("queue", self.build_queue(song_list))

        # Check if the sync has already been started once
        if not self.connected:
            self.connected = True
            socket_io.start_background_task(self.__sync())

    def __sync(self):

        while self.connected:

            webapp_user: UserInformation
            for webapp_user in self.user_information:

                db.session.remove()
                queue: Queue = Queue.query.filter(Queue.spotify_user_db_id == webapp_user.db_id).first()
                song_list: list = Song.query.filter(Song.queue_id == queue.id).order_by(Song.id).all()

                if webapp_user.new_user:
                    emit("queue", self.build_queue(song_list), broadcast=True, room=webapp_user.spotify_id)
                    webapp_user.new_user = False

                # Send a update if the current song changes
                # todo ref to song
                current_song = json.loads(queue.current_song)

                if current_song:
                    if webapp_user.current_song != current_song["item"]["id"]:
                        self.update_current_track(queue, current_song)

                        webapp_user.current_song = current_song["item"]["id"]

                        song_list: list = Song.query.filter(Song.queue_id == queue.id).order_by(Song.id).all()
                        emit("queue", self.build_queue(song_list), broadcast=True, room=webapp_user.spotify_id)

                if webapp_user.song_count != len(song_list):
                    emit("queue", self.build_queue(song_list), broadcast=True, room=webapp_user.spotify_id)

                    webapp_user.song_count = len(song_list)

            socket_io.sleep(1)

    @staticmethod
    def update_current_track(queue: Queue, current_song: dict) -> None:
        """
        Update the current track
        :param queue: The  queue
        :param current_song: The current song dict
        :return: bool
        """

        # Get current song and mark it playing
        new_current_song: Song = Song.query.filter(
            Song.spotify_id == current_song["item"]["id"],
            Song.queue_id == queue.id).order_by(Song.id.desc()).first()

        if new_current_song is None:
            emit("playback_error",
                 "The currently playing song is not in the queue. "
                 "You are not allowed to add songs with the spotify app.")
            update_spotify_queue(queue_id=queue.id, spotify_user_db_id=queue.spotify_user_db_id, remove_current=True)
            return

        new_current_song.playing = True

        # Get all played songs and mark them played
        played_songs: list = Song.query.filter(
            Song.queue_id == new_current_song.queue_id, Song.id < new_current_song.id).all()

        for song in played_songs:
            song.playing = None

        # Update DB
        db.session.commit()
        update_spotify_queue(queue_id=queue.id, spotify_user_db_id=queue.spotify_user_db_id)
        db.session.remove()

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
