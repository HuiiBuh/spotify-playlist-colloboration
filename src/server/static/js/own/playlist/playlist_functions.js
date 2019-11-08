/**
 * Make a api call to get the info of the playlist
 */
function getPlaylistInfo() {
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            updatePlaylistObject(JSON.parse(this.responseText));
            displayPlaylistInfo(true);
        } else if (this.readyState === 4 && this.status !== 200) {
            M.toast({html: "The playlist info could not be loaded", classes: "bg-warning"})
        }
    };
    xhttp.open("GET", playlistAPI, true);
    xhttp.send();
}

/**
 * Update the mainPlaylist with the json from the api request
 * @param json JSON form the api request
 */
function updatePlaylistObject(json) {
    mainPlaylist.author = [json["author"]["name"], json["author"]["url"]];
    mainPlaylist.songCount = json["track_count"];
    mainPlaylist.url = json["url"];
    mainPlaylist.picture = json["image_url"];
    mainPlaylist.name = json["name"];
}

/**
 * Display the Playlist Info
 */
function displayPlaylistInfo() {
    //Set the information
    document.getElementById("playlist-name").innerText = mainPlaylist.name;
    document.getElementById("author").innerText = mainPlaylist.author[0];
    document.getElementById("author").onclick = addOnclick(mainPlaylist.author[1]);
    document.getElementById("duration").innerText = mainPlaylist.durationHumanReadable;
    document.getElementById("song-count").innerText = mainPlaylist.songCount;
    document.getElementById("playlist-url").onclick = addOnclick(mainPlaylist.url);
    document.getElementById("playlist-cover").style.background = 'url(' + mainPlaylist.picture + ')';

    // Add a trash image and remove it as soon as it loads.
    // This is also the indicator for the loading bars to disappear
    let imageLoadingIndicator = document.createElement("img");
    imageLoadingIndicator.src = mainPlaylist.picture;
    imageLoadingIndicator.style.display = "none";
    document.getElementById("playlist-cover").appendChild(imageLoadingIndicator);
    imageLoadingIndicator.onload = function () {
        this.remove();
        document.getElementById("playlist-cover").classList.remove("loading");
        document.getElementById("playlist-cover").parentElement.style.border = "none";

        document.getElementById("loading-playlist-description").style.display = "none";
        document.getElementById("playlist-description").style.display = "table";

        document.getElementById("loading-heading").style.display = "none";
        document.getElementById("playlist-name").style.display = "block";
    }
}