window.onload = function () {
    addEventHandler()
};

function addEventHandler() {
    document.getElementById("add-button").onclick = addPlaylist;

    let playlistList = document.getElementsByClassName("playlist");
    for (let playlistNumber in playlistList) {

        if (!playlistList.hasOwnProperty(playlistNumber)) continue;

        let playlist = playlistList[playlistNumber];
        let deleteButton = playlist.getElementsByClassName("material-icons")[0];
        deleteButton.onclick = deletePlaylist(playlist, deleteButton.id);
    }
}

