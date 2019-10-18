/**
 * Make a api call to get the info of the playlist
 */
function getPlaylistInfo() {
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            createPlaylistFromJSON(JSON.parse(this.responseText));
            displayPlaylistInfo(true);
        }
    };
    xhttp.open("GET", playlistAPI, true);
    xhttp.send();
}

/**
 * Update the mainPlaylist with the json from the api request
 * @param json JSON form the api request
 */
function createPlaylistFromJSON(json) {
    let playlistName = json["name"];
    let author = [json["author"]["name"], json["author"]["url"]];
    let songCount = json["track_count"];
    let url = json["url"];
    let cover = json["image_url"];

    mainPlaylist.author = author;
    mainPlaylist.songCount = songCount;
    mainPlaylist.url = url;
    mainPlaylist.picture = cover;
    mainPlaylist.name = playlistName;
}

/**
 * Display the Playlist Info
 */
function displayPlaylistInfo() {
    document.getElementById("playlist-name").innerText = mainPlaylist.name;
    document.getElementById("author").innerText = mainPlaylist.author[0];
    document.getElementById("author").onclick = function () {
        window.open(mainPlaylist.author[1])
    };
    document.getElementById("duration").innerText = mainPlaylist.durationHumanReadable;
    document.getElementById("song-count").innerText = mainPlaylist.songCount;
    document.getElementById("playlist-url").onclick = function () {
        window.open(mainPlaylist.url)
    };

    document.getElementById("playlist-cover").style.background = 'url(' + mainPlaylist.picture + ')';

    // Add a trash image and remove it as soon as it loads.
    // This is also the indicator for the loading bars to disappear
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