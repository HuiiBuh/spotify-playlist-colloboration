window.onload = function () {
    addEventHandler()
};

function addEventHandler() {
    document.getElementById("add-button").onclick = addPlaylist;

    document.getElementById("playback-control").onchange = toggleQueue;

    document.getElementById("playlist-id").addEventListener("keyup", function (evt) {
        if (evt.code === "Enter" || evt.code === "NumpadEnter") {
            addPlaylist();
        }
    });

    let durationFields = [...document.getElementsByTagName("table")[0].getElementsByTagName("input")];
    durationFields.forEach(input => {
        input.onkeydown = updatePlaylistDuration();
    });

    let playlistList = document.getElementsByClassName("playlist");
    for (let playlistNumber in playlistList) {

        if (!playlistList.hasOwnProperty(playlistNumber)) continue;

        let playlist = playlistList[playlistNumber];
        let deleteButton = playlist.getElementsByClassName("material-icons")[0];
        deleteButton.onclick = deletePlaylist(playlist, deleteButton.id);
        deleteButton.onkeypress = function (event) {
            if (event.code === "Enter" || event.code === "NumpadEnter") {
                deletePlaylist(playlist, deleteButton.id)();
            }
        }
    }

    let element = document.querySelectorAll('.autocomplete')[0];
    let instance = M.Autocomplete.getInstance(element);
    instance.updateData(autocomplete);

}

