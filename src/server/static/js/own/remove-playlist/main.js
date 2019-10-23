M.AutoInit();
let bodyParams = {};
bodyParams["playlists"] = {};
bodyParams["spotify_user"] = new URL(window.location.href).searchParams.get("spotify-user-id");
let first = true;

window.onload = function () {
    addEventHandler()
};


function addEventHandler() {
    let playlistList = document.getElementsByClassName("playlist");
    document.getElementById("add-playlist-song-id").onclick = addPlaylistId;

    document.getElementById("add-playlists").onclick = addToPlaylist;

    for (let playlistNumber in playlistList) {
        if (playlistList.hasOwnProperty(playlistNumber)) {
            let playlist = playlistList[playlistNumber];
            let playlistId = playlist.id;
            let deleteKey = playlist.getElementsByClassName("material-icons")[0];
            deleteKey.onclick = deletePlaylist(playlistId, playlist);
        }
    }

}


function getNewPlaylists() {

    for (let playlistID in bodyParams["playlists"]) {
        let xhttp = new XMLHttpRequest();
        let url = playlistAPI + playlistID;

        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                displayNewPlaylist(JSON.parse(this.responseText));
            }
        };

        xhttp.open("GET", url, true);
        xhttp.send();
    }

    function displayNewPlaylist(playlistJSON) {
        let root = document.getElementById("playlist-box");

        let playlist = document.createElement("div");
        playlist.setAttribute("class", "row flex-v-center playlist");
        playlist.id = playlistJSON["id"];
        root.appendChild(playlist);

        let imageDiv = document.createElement("div");
        imageDiv.setAttribute("class", "col xs3 s2 l1 center flex-v-center song-cover-div");
        playlist.appendChild(imageDiv);

        let image = document.createElement("img");
        image.setAttribute("alt", "cover");
        image.setAttribute("src", playlistJSON["image_url"]);
        imageDiv.appendChild(image);

        let textDiv = document.createElement("div");
        textDiv.setAttribute("class", "col xs8 s9 l10");
        textDiv.style.textAlign = "left";
        playlist.appendChild(textDiv);

        let text = document.createElement("a");
        text.setAttribute("class", " pointer underline black-text");
        text.innerText = playlistJSON["name"];
        text.onclick = addOnClick(playlistJSON["url"]);
        textDiv.appendChild(text);

        let removeDiv = document.createElement("div");
        removeDiv.setAttribute("class", "col xs1 s1");
        playlist.appendChild(removeDiv);

        let removeIcon = document.createElement("i");
        removeIcon.setAttribute("class", "material-icons pointer");
        removeIcon.innerText = "delete";
        removeIcon.onclick = deletePlaylist(playlistJSON["id"], playlist);
        removeDiv.appendChild(removeIcon);

        function addOnClick(url) {
            return function () {
                window.open(url)
            };
        }
    }
}

function addToPlaylist() {

    if (Object.entries(bodyParams["playlists"]).length === 0) {
        return
    }

    let xhttp = new XMLHttpRequest();

    xhttp.open("POST", addPlaylistAPI, true);

    xhttp.onreadystatechange = function () {

        if (this.readyState === 4 && this.status === 200) {
            getNewPlaylists();
            document.getElementById("add-playlist-song-input").innerText = "";
            bodyParams["playlists"] = {};
            bodyParams["spotify_user"] = new URL(window.location.href).searchParams.get("spotify-user-id");
        }

        if (this.readyState === 4 && this.status === 400) {
            let r = this.responseText.split("<p>")[1];
            alert(r.replace("</p>", ""));
        }
    };
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(bodyParams));
}

function addPlaylistId() {
    let playlistIdValue = document.getElementById("add-playlist-song-input").value;
    let userValue = document.getElementById("user-select").value;
    if (playlistIdValue in bodyParams["playlists"] || playlistIdValue === "" || userValue === "")
        return;

    let root = document.getElementById("add-playlist-list");

    if (!first) {
        let ul = document.createElement("ul");
        root.appendChild(ul);

        let divider = document.createElement("li");
        divider.setAttribute("class", "divider");
        ul.appendChild(divider);
    }
    first = false;

    let playlistDivRow = document.createElement("div");
    playlistDivRow.setAttribute("class", "row");
    root.appendChild(playlistDivRow);

    let idRoundDiv = document.createElement("div");
    idRoundDiv.setAttribute("class", "col s12 rounded margin-bottom");
    playlistDivRow.appendChild(idRoundDiv);

    let idName = document.createElement("div");
    idName.setAttribute("class", "col s5 background light-nav-bg-color  rounded-left");
    idName.innerText = "Playlist ID";
    playlistDivRow.appendChild(idName);

    let playlistId = document.createElement("div");
    playlistId.setAttribute("class", "col s7 background light-bg-color rounded-right");
    playlistId.innerText = playlistIdValue;
    playlistDivRow.appendChild(playlistId);


    let userDivRow = document.createElement("div");
    userDivRow.setAttribute("class", "row");
    root.appendChild(userDivRow);

    let userLabelDiv = document.createElement("div");
    userLabelDiv.setAttribute("class", "col s5 background light-nav-bg-color  rounded-left");
    userLabelDiv.innerText = "Username";
    userDivRow.appendChild(userLabelDiv);

    let userDiv = document.createElement("div");
    userDiv.setAttribute("class", "col s7 background light-bg-color rounded-right");
    userDiv.innerText = userValue;
    userDivRow.appendChild(userDiv);

    bodyParams["playlists"][playlistIdValue] = userValue;
}


function deletePlaylist(id, playlist) {
    let playlistId = id;
    let playlistNode = playlist;
    return function () {
        let xhttp = new XMLHttpRequest();
        let url = removePlaylistAPI + playlistId;

        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                playlistNode.remove()
            }
        };
        xhttp.open("GET", url, true);
        xhttp.send();
    }
}