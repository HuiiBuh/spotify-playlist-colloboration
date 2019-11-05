let playlistPlaceholder = function () {
    let tr = document.createElement("tr");
    tr.id = "no-playlists-placeholder";

    tr.appendChild(document.createElement("td"));
    tr.appendChild(document.createElement("td"));

    let td = document.createElement("td");
    td.setAttribute("class", "center-align");
    td.innerText = "No Playlists";
    tr.appendChild(td);

    tr.appendChild(document.createElement("td"));
    tr.appendChild(document.createElement("td"));
    return tr;
}();

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
        table.appendChild(playlistPlaceholder);
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