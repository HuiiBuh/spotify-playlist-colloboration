from server.backup import backup_job
from server.main import app
from threading import Thread

if __name__ == "__main__":
    backup_thread = Thread(target=backup_job)
    backup_thread.setName("backup_playlist")
    backup_thread.start()

    app.run(debug=True)
