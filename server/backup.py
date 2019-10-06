import json
import os

from datetime import datetime
import schedule
import time
import threading

from pyfy import Spotify

from server.functions import get_settings


def backup_job():
    # schedule.every().day.at("01:00").do(backup)
    schedule.every(10).minutes.do(backup)
    while threading.main_thread().is_alive():
        schedule.run_pending()
        time.sleep(1)


def backup():
    settings = get_settings()

    auth_token = settings["OAuth-Token"]
    playlist_id = settings["playlist-id"]
    sp = Spotify(auth_token)

    raq_track_list = sp.playlist_tracks(playlist_id=playlist_id, fields="items(track(href))")["items"]

    track_list = []

    for track in raq_track_list:
        href = track["track"]["href"]
        track_id = href.split("/")[-1]
        track_list.append(track_id)

    backup_path = settings["backup_path"]
    if not os.path.isdir(backup_path):
        os.mkdir(backup_path)

    now = datetime.now()
    filename = f"{now.year}-{now.month}-{now.day}_{datetime.timestamp(now)}.json"

    with open(os.path.join(backup_path, filename), 'w+') as backup_file:
        backup_file.write(json.dumps(track_list))
