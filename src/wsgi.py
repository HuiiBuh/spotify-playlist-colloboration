from server import app, socket_io

if __name__ == "__main__":
    print("http://0.0.0.0:5000/playback/nhaderer")
    socket_io.run(app, host='0.0.0.0', port=5000, debug=True)
