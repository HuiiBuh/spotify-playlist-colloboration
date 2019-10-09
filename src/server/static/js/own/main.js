M.AutoInit();

//ToDo Noch jede api schnittstellt mit globaler variable mit flask deklarieren

window.onload = function () {

    getPlaylistInfo("/api/v1/spotify/playlist")


};


document.getElementById("playlist-name").onclick = function () {
    let url = "/api/v1/spotify/playlist/tracks";
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            displayPlaylistSongs(JSON.parse(this.responseText))
        }
    };

    xhttp.open("GET", url, true);
    xhttp.send();
};

function getPlaylistInfo(url) {
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            displayPlaylistInfo(JSON.parse(this.responseText))
        }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
}

function displayPlaylistInfo(playlistJson) {

    document.getElementById("playlist-name").innerText = playlistJson["name"];
    document.getElementById("author").innerText = playlistJson["author"]["name"];
    document.getElementById("author").href = playlistJson["author"]["url"];
    document.getElementById("duration").innerText = "Not implemented yet.";
    document.getElementById("song-count").innerText = playlistJson["track_count"];
    document.getElementById("playlist-url").href = playlistJson["url"];
    document.getElementById("playlist-cover").src = playlistJson["image_url"];
}

function displayPlaylistSongs(songList) {

    console.log(songList);

    for (let songId in songList) {
        let song = songList[songId]


    }
}