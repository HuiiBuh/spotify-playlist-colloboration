window.onload = function () {
    addEventHandler()
};

function addEventHandler() {
    document.getElementById("add-playlist").onclick = addPlaylistsToUser;

    let playlistList = document.getElementsByClassName("playlist");

    for (let playlistNumber in playlistList) {
        if (playlistList.hasOwnProperty(playlistNumber)) {
            let playlist = playlistList[playlistNumber];
            let deleteIcon = playlist.getElementsByClassName("material-icons")[0];
            let name = playlist.getElementsByClassName("playlist-name")[0].innerText;
            deleteIcon.onclick = removePlaylistFromUser(playlist, playlist["id"], name);
        }
    }
}
