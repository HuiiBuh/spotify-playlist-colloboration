async function addPlaylist() {
    let playlistID = document.getElementById("playlist-id").value;

    if (playlistID === "" || /^ *$/.test(playlistID)) {
        return 0
    }

    addPlaylistToUser(playlistID)
}


function addPlaylistToUser(playlistID) {
    let xhttp = new XMLHttpRequest();
    let url = addPlaylistAPI + playlistID;

    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            M.toast({html: "Success", classes: "green"});
            displayNewPlaylist(JSON.parse(this.responseText));
            return
        } else if (this.readyState === 4) {
            showErrorMessage(this);
        }
    };

    xhttp.open("GET", url, true);
    xhttp.send();
}

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
    deleteIcon.innerText = "delete";
    deleteIcon.id = json["id"];
    deleteIcon.onclick = deletePlaylist(tr, json["id"]);
    deleteTd.appendChild(deleteIcon);
}