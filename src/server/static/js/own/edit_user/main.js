window.onload = function () {
    addEventHandler()
};

function addEventHandler() {
    //Add a event listener to the add playlist button
    document.getElementById("add-playlist").onclick = addPlaylistsToUser;

    //Get all playlists
    let playlistList = document.getElementsByClassName("playlist");

    for (let playlistNumber in playlistList) {
        if (!playlistList.hasOwnProperty(playlistNumber)) continue;

        //Add a event listener to every delete icon
        let playlist = playlistList[playlistNumber];
        let deleteIcon = playlist.getElementsByClassName("material-icons")[0];
        let name = playlist.getElementsByClassName("playlist-name")[0].innerText;
        deleteIcon.onclick = removePlaylistFromUser(playlist, playlist["id"], name);

    }
}
