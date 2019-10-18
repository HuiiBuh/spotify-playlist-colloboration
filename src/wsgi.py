from threading import Thread

from server.backup import backup_job
from server import app

if __name__ == "__main__":
    backup_thread = Thread(target=backup_job)
    backup_thread.setName("backup_playlist")
    backup_thread.start()

    app.run(debug=True, host='0.0.0.0', port=5000)


# {'error': {'status': 401, 'message': 'The access token expired'}}