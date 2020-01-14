function startQueueSync() {
    let socket = io.connect("/api/queue");

    socket.on("connect", function () {
        socket.emit("update_queue", {"spotify_user_id": spotifyUserID});
    });

    socket.on("queue", function (msg) {
        updateQueue(msg)
    });

    socket.on("playback_error", function (msg) {
        showErrorMessage(msg)
    })
}


function updateQueue(json) {
    let played = json.played;
    let playing = json.playing;
    let queue = json.queue;

    let root = document.getElementById("queue");
    root.innerText = "";

    queue.forEach(song => {
        let [title, artist, album, cover] = cleanSongJSON(song);

        let songDiv = document.createElement("div");
        songDiv.setAttribute("class", "flex-v-center queue-song");
        songDiv.id = title.url.split("track/")[1];
        root.appendChild(songDiv);

        let coverImageDiv = document.createElement("div");
        coverImageDiv.setAttribute("class", "col s4 l3 xl2 center flex-v-center no-padding-right small-padding-left");
        songDiv.appendChild(coverImageDiv);

        let img = document.createElement("img");
        img.setAttribute("alt", "cover");
        img.src = cover;
        coverImageDiv.appendChild(img);

        let infoDiv = document.createElement("div");
        infoDiv.setAttribute("class", "col s8 l9 xl10 to-long");
        songDiv.appendChild(infoDiv);

        let titleDiv = document.createElement("div");
        titleDiv.setAttribute("class", "s12 to-long");
        infoDiv.appendChild(titleDiv);

        let titleA = document.createElement("a");
        titleA.setAttribute("class", "pointer underline no-wrap");
        titleA.href = title.url;
        titleA.innerText = title.name;
        titleDiv.appendChild(titleA);

        let artistDiv = document.createElement("div");
        artistDiv.setAttribute("class", "s12 to-long");
        infoDiv.appendChild(artistDiv);

        let artistA = document.createElement("a");
        artistA.setAttribute("class", "pointer underline no-wrap");
        artistA.href = artist.url;
        artistA.innerText = artist.name;
        artistDiv.appendChild(artistA);

        let divider = document.createElement("div");
        divider.setAttribute("class", "divider small-margin-bottom small-margin-top");
        root.appendChild(divider)
    });
}
