import json

from server import spotify, socket_io, db
from server.api.api_functions import get_token_by_spotify_user_id
from server.main.modals import SpotifyUser, Queue
from server.spotify import SpotifyAuthorisationToken


class PlaybackUpdater:
    """
    Updater class
    """

    class __Updater:
        """
        Class that actually handles the updating
        """

        def __init__(self, spotify_user_id: str):
            """
            Create a new updater
            :param spotify_user_id: The spotify user id
            """

            self.spotify_user_id_list: list = [spotify_user_id]
            socket_io.start_background_task(self.update_database)

        def remove_user(self, spotify_user_id):
            try:
                self.spotify_user_id_list.remove(spotify_user_id)
            except ValueError:
                print("Could not remove the user")

        def update_database(self):
            """
            Update the database
            :return: None
            """

            # As long as there are users in the list
            while self.spotify_user_id_list:
                for spotify_user_id in self.spotify_user_id_list:

                    auth_token: SpotifyAuthorisationToken = get_token_by_spotify_user_id(spotify_user_id)
                    if not auth_token:
                        self.spotify_user_id_list.remove(spotify_user_id)
                        break

                    spotify_user = SpotifyUser.query.filter(SpotifyUser.spotify_user_id == spotify_user_id).first()
                    self.update_current_song(auth_token, spotify_user.queue)

                socket_io.sleep(1)

            # Stop the polling and remove the __Update instance
            PlaybackUpdater.instance = None

        @staticmethod
        def update_current_song(auth_token: SpotifyAuthorisationToken, queue: Queue):
            """
            Update the current song
            :param auth_token: The auth token of the current user
            :param queue: The queue database object
            :return: None
            """

            try:
                current_playback = spotify.current_playback(auth_token)
            except SpotifyAuthorisationToken as e:
                print(str(e))
                return

            queue.current_song = json.dumps(current_playback)
            db.session.commit()

            try:
                devices = spotify.devices(auth_token)
            except SpotifyAuthorisationToken as e:
                print(str(e))
                return

            queue.devices = json.dumps(devices)
            db.session.commit()

    instance = None

    def __init__(self, spotify_user_id):
        """
        Init the class and return update the private class if the Updater has already instanced once
        :param spotify_user_id: The spotify user id
        """

        # Check if there is a Updater instance and create it if there is no such one
        if not PlaybackUpdater.instance:
            PlaybackUpdater.instance = PlaybackUpdater.__Updater(spotify_user_id)
        else:
            # Check if the user is already in the list
            if spotify_user_id in PlaybackUpdater.instance.spotify_user_id_list:
                return

            # Add the user to the polling list
            PlaybackUpdater.instance.spotify_user_id_list.append(spotify_user_id)

    @staticmethod
    def remove_user(spotify_user_id):
        """
        Remove the user from the update list
        :param spotify_user_id: The spotify user id
        :return: None
        """
        try:
            PlaybackUpdater.instance.remove_user(spotify_user_id)
        except AttributeError:
            print("Could not remove the user")

    def __getattr__(self, name):
        """
        Return the attribute of the private class instead of the Updater class
        :param name: The attribute name
        :return: The value of the attribute
        """

        return getattr(self.instance, name)


class QueueUpdater:
    class __Updater:
        def __init__(self, spotify_user_id: str):
            self.spotify_user_id_list: list = [spotify_user_id]
            socket_io.start_background_task(self.update_queues)

        def update_queues(self):
            # As long as there are users in the list
            while self.spotify_user_id_list:
                socket_io.sleep(1)

            # Stop the polling and remove the __Update instance
            QueueUpdater.instance = None

    instance = None

    def __init__(self, spotify_user_id):
        """
        Init the class and return update the private class if the Updater has already instanced once
        :param spotify_user_id: The spotify user id
        """

        # Check if there is a Updater instance and create it if there is no such one
        if not QueueUpdater.instance:
            QueueUpdater.instance = QueueUpdater.__Updater(spotify_user_id)
        else:
            # Check if the user is already in the list
            if spotify_user_id in QueueUpdater.instance.spotify_user_id_list:
                return

            # Add the user to the polling list
            QueueUpdater.instance.spotify_user_id_list.append(spotify_user_id)

    @staticmethod
    def remove_user(spotify_user_id):
        """
        Remove the user from the update list
        :param spotify_user_id: The spotify user id
        :return: None
        """
        try:
            QueueUpdater.instance.remove_user(spotify_user_id)
        except AttributeError:
            print("Could not remove the user")

    def __getattr__(self, name):
        """
        Return the attribute of the private class instead of the Updater class
        :param name: The attribute name
        :return: The value of the attribute
        """

        return getattr(self.instance, name)
