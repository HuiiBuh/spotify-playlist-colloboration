window.onload = function () {
    addEventHandler()
};


function addPlaylistsToUser() {
    let select = M.FormSelect.getInstance(document.getElementById("playlist-select"));
    let selectValues = select.getSelectedValues();
    selectValues.splice(0, 1);

    let sendValue = {};
    sendValue["playlists"] = selectValues;

    let url_string = window.location.href;
    let url = new URL(url_string);
    sendValue["user-id"] = url.searchParams.get("user-id");


    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", addUserToPlaylistAPI, true);
    xhttp.setRequestHeader("Content-Type", "application/json");

    xhttp.onreadystatechange = function () {
        if (this.status === 200 && this.readyState === 4) {
            M.toast({html: "Success", classes: "green"})
        } else if (this.readyState === 4) {
            showErrorMessage(this)
        }
    };
    xhttp.send(JSON.stringify(sendValue))
}

function addEventHandler() {
    document.getElementById("add-playlist").onclick = addPlaylistsToUser;

    let playlistList = document.getElementsByClassName("playlist");

    for (let playlistNumber in playlistList) {
        if (playlistList.hasOwnProperty(playlistNumber)) {
            let playlist = playlistList[playlistNumber];
            let deleteIcon = playlist.getElementsByClassName("material-icons")[0];
            deleteIcon.onclick = removePlaylistFromUser(playlist, playlist["id"]);
        }
    }
}

function removePlaylistFromUser(playlistNode, playlistID) {
    return function () {
        let xhttp = new XMLHttpRequest();
        xhttp.open("POST", removePlaylistFromUserAPI, true);
        xhttp.setRequestHeader("Content-Type", "application/json");

        xhttp.onreadystatechange = function () {
            if (this.status === 200 && this.readyState === 4) {
                playlistNode.remove();
            } else if (this.status !== 200 && this.readyState === 4) {
                showErrorMessage(this)
            }
        };

        let url_string = window.location.href;
        let url = new URL(url_string);
        let userID = url.searchParams.get("user-id");

        let sendValue = {};
        sendValue["user-id"] = userID;
        sendValue["playlist-id"] = playlistID;


        xhttp.send(JSON.stringify(sendValue));
    }
}