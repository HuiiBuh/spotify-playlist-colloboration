function getPlaylistInfo(url) {
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            createPlaylistFromJSON(JSON.parse(this.responseText));
            getPlaylistSongs("/api/spotify/playlist/tracks");
            displayPlaylistInfo(true);
        }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
}


function createPlaylistFromJSON(json) {
    let playlistName = json["name"];
    let author = [json["author"]["name"], json["author"]["url"]];
    let songCount = json["track_count"];
    let url = json["url"];
    let cover = json["image_url"];

    mainPlaylist = new Playlist(playlistName, author, songCount, url, cover, "main")
}


function displayPlaylistInfo(first) {

    document.getElementById("playlist-name").innerText = mainPlaylist.name;
    document.getElementById("author").innerText = mainPlaylist.author[0];
    document.getElementById("author").onclick = function () {
        window.open(mainPlaylist.author[1])
    };
    document.getElementById("duration").innerText = mainPlaylist.duration;
    document.getElementById("song-count").innerText = mainPlaylist.songCount;
    document.getElementById("playlist-url").onclick = function () {
        window.open(mainPlaylist.url)
    };

    document.getElementById("playlist-cover").style.background = 'url(' + mainPlaylist.picture + ')';

    function updatePlaceholder() {
        let trash = document.createElement("img");
        trash.src = mainPlaylist.picture;
        trash.style.display = "none";
        document.getElementById("playlist-cover").appendChild(trash);
        trash.onload = function () {
            this.remove();
            document.getElementById("playlist-cover").classList.remove("loading");

            document.getElementById("loading-playlist-description").style.display = "none";
            document.getElementById("playlist-description").style.display = "table";

            document.getElementById("loading-heading").style.display = "none";
            document.getElementById("playlist-name").style.display = "block";
        }
    }

    if (first) {
        updatePlaceholder()
    }
}


function updatePlaylistInfo() {
    document.getElementById("song-count").innerText = mainPlaylist.songCount;
    document.getElementById("duration").innerText = mainPlaylist.durationHumanReadable;
}