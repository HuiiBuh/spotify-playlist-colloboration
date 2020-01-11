import threading
import time


class Updater:
    """
    Updater class
    """

    class __Updater:
        """
        Class that actually handles the updating
        """

        def __init__(self, spotify_user_id):
            """
            Create a new updater
            :param spotify_user_id: The spotify user id
            """

            self.spotify_user_id_list: list = [spotify_user_id]
            threading.Thread(target=self.update_queues).run()

        def remove_user(self, spotify_user_id):
            self.spotify_user_id_list.remove(spotify_user_id)

        def update_queues(self):
            """
            Update the database
            :return: None
            """

            while True:
                for spotify_user_id in self.spotify_user_id_list:
                    print(spotify_user_id)
                time.sleep(1)

    instance = None

    def __init__(self, spotify_user_id):
        """
        Init the class and return update the private class if the Updater has already instanced once
        :param spotify_user_id: The spotify user id
        """

        if not Updater.instance:
            Updater.instance = Updater.__Updater(spotify_user_id)
        else:
            if spotify_user_id in Updater.instance.spotify_user_id_list:
                return

            Updater.instance.spotify_user_id_list.append(spotify_user_id)

    @staticmethod
    def remove_user(spotify_user_id):
        """
        Remove the user from the update list
        :param spotify_user_id: The spotify user id
        :return: None
        """

        Updater.instance.remove_user(spotify_user_id)

    def __getattr__(self, name):
        """
        Return the attribute of the private class instead of the Updater class
        :param name: The attribute name
        :return: The value of the attribute
        """

        return getattr(self.instance, name)
