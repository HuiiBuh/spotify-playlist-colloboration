function startQueueSync() {
    let socket = io.connect("/api/queue");

    socket.on("connect", function (msg) {
        socket.emit("start_sync", {"spotify_user_id": spotifyUserID})
    });

    socket.on("queue", function (msg) {
        updateQueue(msg)
    })
}


function updateQueue(json) {

}
