/**
 * Add the playlist to the spotify user
 */
function addPlaylist() {
    let playlistID = document.getElementById("playlist-id").value;

    //Check if the playlist is empty
    if (playlistID === "" || /^ *$/.test(playlistID)) {
        M.toast({html: "You passed an empty playlist", classes: "bg-warning"});
        return;
    }

    //Add the playlist to the user
    addPlaylistToUser(playlistID)
}


/**
 * Add the playlist
 * @param playlistID The id of the playlist that is supposed to be added
 */
function addPlaylistToUser(playlistID) {
    let xhttp = new XMLHttpRequest();
    let url = addPlaylistAPI + playlistID;

    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            M.toast({html: "Successfully added an new playlist", classes: "bg-success"});
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
    name.innerText = json["name"];

    name.onclick = addOnclick(json["external_urls"]["spotify"]);
    tr.appendChild(name);

    let author = document.createElement("td");
    author.innerText = json["owner"]["display_name"];
    author.onclick = addOnclick(json["owner"]["external_urls"]["spotify"]);
    tr.appendChild(author);

    let trackCount = document.createElement("td");
    trackCount.innerText = json["tracks"]["total"];
    tr.appendChild(trackCount);

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