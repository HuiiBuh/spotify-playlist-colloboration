M.AutoInit();
let playlistIDs = [];


window.onload = function () {
    addEventHandler()
};

function addToPlaylist() {
    //TODO
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

function addPlaylistId(evt) {
    let value = document.getElementById("add-playlist-song-input").value;
    if (playlistIDs.includes(value))
        return;

    let playlistLi = document.createElement("li");
    playlistLi.setAttribute("class", "playlist-add");
    playlistLi.innerText = value;

    let root = document.getElementById("add-playlist-list");
    root.appendChild(playlistLi);
    playlistIDs.push(value);
}


function deletePlaylist(id, playlist) {
    let playlistId = id;
    let playlistNode = playlist;
    return function (evt) {
        let xhttp = new XMLHttpRequest();
        let url = removePlaylistAPI + playlistId;

        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                playlistNode.remove()
            }
        };
        xhttp.open("GET", url);
        xhttp.send();
    }
}