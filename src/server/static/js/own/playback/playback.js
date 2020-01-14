function startPlaybackSync() {

    let socket = io.connect("/api/playback");

    socket.on('connect', function () {
        socket.emit('start_sync', {"spotify_user_id": spotifyUserID});
    });

    let o = 0;
    socket.on("playback", function (msg) {
        let n = parseInt((Date.now() / 1000))
        console.log(n - o)
        o = n;

        updateCurrentlyPlaying(msg)

    });

    socket.on("devices", function (msg) {
        updateDevicesView(msg)
    })
}

let currentSong = "Some string";

function updateCurrentlyPlaying(json) {
    if (!json.playing) {
        notPlaying();
        return;
    }

    updatePlaybackState(json["song"]);

    if (currentSong === json["song"]["item"]["id"]) return;

    currentSong = json["song"]["item"]["id"];

    let song = json["song"]["item"];
    let cover = "/proxy/" + song["album"]["images"][0]["url"];

    let album = {
        "name": song["album"]["name"],
        "url": song["album"]["external_urls"]["spotify"]
    };

    let artist = {
        "name": song["artists"][0]["name"],
        "url": song["artists"][0]["external_urls"]["spotify"]
    };

    let title = {
        "name": song["name"],
        "url": song["external_urls"]["spotify"]
    };

    let titleA = document.getElementById("song");
    titleA.innerText = title.name;
    titleA.setAttribute("href", title.url);
    titleA.setAttribute("target", "_blank");

    let artistA = document.getElementById("artist");
    artistA.innerText = artist.name;
    artistA.setAttribute("href", artist.url);
    artistA.setAttribute("target", "_blank");

    let temp = document.createElement("img");
    temp.src = cover;

    temp.onload = () => {
        document.getElementsByClassName("cover-image")[0].src = cover;
        document.getElementsByClassName("middle")[0].style.display = "none";
        updateBackground();
    };

    document.getElementsByClassName("middle")[0].style.display = "block";
}

function notPlaying() {
    M.toast({html: "No song is currently playing. Start spotify and play a song,", classes: "bg-warning"});

    document.getElementsByClassName('cover-image')[0].src = "/static/icons/default_playlist_cover.png";

    document.getElementById("artist").innerText = "No Song";
    document.getElementById("song").innerText = "Playing";

    document.getElementById("current-time").innerText = "00:00";
    document.getElementById("total-time").innerText = "00:00";

    document.getElementsByClassName("determinate")[0].style.width = "0";
    updateBackground();
    toggleDevices(show = true);
}

function updatePlaybackState(json) {

    // off, track, context
    let repeat = json["repeat_state"];
    let shuffle = json["shuffle_state"];
    let progress = parseInt(json["progress_ms"] / json["item"]["duration_ms"] * 100);
    let playing = json["is_playing"];


    if (playing === true) {
        document.getElementById("pause").style.display = "block";
        document.getElementById("play").style.display = "none";
    } else {
        document.getElementById("play").style.display = "block";
        document.getElementById("pause").style.display = "none";
    }

    if (shuffle === true) {
        document.getElementById("shuffle").style.color = "white";

    } else {
        document.getElementById("shuffle").style.color = "darkgray";
    }

    if (repeat === "off") {
        document.getElementById("repeat").style.display = "block";
        document.getElementById("repeat").style.color = "darkgray";
        document.getElementById("repeat-one").style.display = "none";

    } else if (repeat === "track") {
        document.getElementById("repeat-one").style.display = "block";
        document.getElementById("repeat").style.display = "none";
    } else if (repeat === "context") {
        document.getElementById("repeat").style.display = "block";
        document.getElementById("repeat").style.color = "white";
        document.getElementById("repeat-one").style.display = "none";
    }

    document.getElementsByClassName("determinate")[0].style.width = progress + "%";

    document.getElementById("current-time").innerText = msToHumanReadable(json["progress_ms"]);
    document.getElementById("total-time").innerText = msToHumanReadable(json["item"]["duration_ms"]);

}


function pause() {
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            document.getElementById("play").style.display = "block";
            document.getElementById("pause").style.display = "none";
        } else if (this.readyState === 4) {
            showErrorMessage(this);
            document.getElementById("play").style.display = "none";
            document.getElementById("pause").style.display = "block";
        }
    };

    xhttp.open("PUT", pauseAPI, true);
    xhttp.send();

}


function play() {
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            document.getElementById("play").style.display = "none";
            document.getElementById("pause").style.display = "block";
        } else if (this.readyState === 4) {
            showErrorMessage(this);
            document.getElementById("play").style.display = "block";
            document.getElementById("pause").style.display = "none";
        }
    };

    xhttp.open("PUT", playAPI, true);
    xhttp.send();
}


function previous() {
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            startPlaybackSync();
        } else if (this.readyState === 4) {
            showErrorMessage(this);
        }
    };

    xhttp.open("POST", previousAPI, true);
    xhttp.send();
}

function next() {
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            startPlaybackSync();
        } else if (this.readyState === 4) {
            showErrorMessage(this);
        }
    };

    xhttp.open("POST", nextAPI, true);
    xhttp.send();
}
