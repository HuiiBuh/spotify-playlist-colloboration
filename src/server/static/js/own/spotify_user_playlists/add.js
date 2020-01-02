/**
 * Add the playlist to the spotify user
 */
function addPlaylist() {
    let playlistID = document.getElementById("playlist-id").value;
    let songLength = document.getElementById("songlength-id").value;

    if (/^\s*$/g.test(songLength)) {
        songLength = 0;
    }

    //Check if the playlist is empty
    if (playlistID === "" || /^ *$/.test(playlistID)) {
        M.toast({html: "You passed an empty playlist", classes: "bg-warning"});
        return;
    }

    if (playlistID.search(" - ") !== -1) {
        playlistID = playlistID.split(" - ")[1];
    }

    //Add the playlist to the user
    addPlaylistToUser(playlistID, songLength);
}


/**
 * Add the playlist
 * @param playlistID The id of the playlist that is supposed to be added
 * @param songLength The song length (0) if as long as possible
 */
function addPlaylistToUser(playlistID, songLength) {
    let xhttp = new XMLHttpRequest();

    let url_string = window.location.href;
    let currentUrl = new URL(url_string);
    let spotifyUserID = currentUrl.searchParams.get("spotify-user-id");

    let url = addPlaylistAPI + playlistID + "&spotify-user-id=" + spotifyUserID + "&song-length=" + songLength;

    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            M.toast({html: "Successfully added an new playlist", classes: "bg-success"});
            document.getElementById("playlist-id").value = null;
            displayNewPlaylist(JSON.parse(this.responseText));
        } else if (this.readyState === 4) {
            showErrorMessage(this);
        }
    };

    xhttp.open("GET", url, true);
    xhttp.send();
}

/**
 * Display the successfully added playlist
 * @param json The json of the new playlist
 */
function displayNewPlaylist(json) {
    if (document.getElementById("no-playlists-placeholder") !== null) {
        document.getElementById("no-playlists-placeholder").remove();
    }

    let root = document.getElementById("insert");

    let tr = document.createElement("tr");
    tr.setAttribute("class", "playlist");
    root.appendChild(tr);

    let name = document.createElement("td");
    tr.appendChild(name);

    let nameA = document.createElement("a");
    nameA.setAttribute("class", "black-text pointer underline");
    nameA.innerText = json["name"];
    nameA.onclick = urlOnclick(json["external_urls"]["spotify"]);
    name.appendChild(nameA);

    let author = document.createElement("td");
    tr.appendChild(author);

    let authorA = document.createElement("a");
    authorA.innerText = json["owner"]["display_name"];
    authorA.setAttribute("class", "black-text pointer underline");
    authorA.onclick = urlOnclick(json["owner"]["external_urls"]["spotify"]);
    author.appendChild(authorA);

    let trackCount = document.createElement("td");
    trackCount.innerText = json["tracks"]["total"];
    tr.appendChild(trackCount);

    let songLength = document.createElement("td");
    songLength.setAttribute("class", "song-length no-padding");
    tr.appendChild(songLength);

    let songLengthInput = document.createElement("input");
    songLengthInput.setAttribute("type", "number");
    songLengthInput.setAttribute("class", "no-margin");
    songLengthInput.setAttribute("default-duration", json.duration);
    songLengthInput.setAttribute("value", json.duration);
    songLengthInput.id = json["id"] + "-input";
    songLengthInput.onkeydown = updatePlaylistDuration();
    songLength.appendChild(songLengthInput);

    let deleteTd = document.createElement("td");
    tr.appendChild(deleteTd);

    let deleteIcon = document.createElement("i");
    deleteIcon.setAttribute("class", "material-icons  pointer primary-text-color");
    deleteIcon.setAttribute("tabindex", "0");
    deleteIcon.innerText = "delete";
    deleteIcon.id = json["id"];
    deleteIcon.onclick = deletePlaylist(tr, json["id"]);
    deleteIcon.onkeypress = function (evt) {
        if (evt.code === "Enter" || evt.code === "NumpadEnter") {
            deletePlaylist(tr, json["id"])();
        }
    };
    deleteTd.appendChild(deleteIcon);
    sort.refresh();
}
