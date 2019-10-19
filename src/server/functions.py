import json
import os


def get_settings(path="./server/settings/settings_production.json"):
    if not os.path.isfile(path):
        return None

    with open(path, "r", encoding="UTF-8") as settings_file:
        contend = settings_file.read()

    try:
        return_contend = json.loads(contend)
    except json.decoder.JSONDecodeError:
        return_contend = None

    return return_contend
