function removePlaylistFromUser(playlistNode, playlistID, name) {
    return function () {
        let xhttp = new XMLHttpRequest();
        xhttp.open("POST", removePlaylistFromUserAPI, true);
        xhttp.setRequestHeader("Content-Type", "application/json");

        xhttp.onreadystatechange = function () {
            if (this.status === 200 && this.readyState === 4) {
                playlistNode.remove();
                checkIfTableIsEmpty();
                addPlaylistToSelect(playlistID, name);
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

function checkIfTableIsEmpty() {
    let table = document.getElementsByTagName("tbody")[0];

    if (table.innerText === "") {
        let tr = document.createElement("tr");

        let td = document.createElement("td");
        td.setAttribute("class", "center-align");
        td.setAttribute("colspan", "100%");
        td.innerText = " This user has no playlists ";
        tr.appendChild(td);

        table.appendChild(tr);
    }
}

function addPlaylistToSelect(playlistID, name) {
    let select = document.getElementById("playlist-select");

    select.querySelectorAll("[disabled]")[0].innerText = "Select a Playlist";


    let option = document.createElement("option");
    option.setAttribute("value", playlistID);
    option.innerText = name;
    select.appendChild(option);
    M.FormSelect.init(select);
}