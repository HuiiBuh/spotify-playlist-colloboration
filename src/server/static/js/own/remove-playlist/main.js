M.AutoInit();
let bodyParams = {};
bodyParams["playlists"] = {};
let first = true;


window.onload = function () {
    addEventHandler()
};

function addToPlaylist(evt) {

    if (Object.entries(bodyParams["playlists"]).length === undefined) {
        return
    }

    let xhttp = new XMLHttpRequest();
    let url = addPlaylistAPI;

    xhttp.open("POST", url, true);

    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            alert("sdf")
        }
    };
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(bodyParams));
}

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