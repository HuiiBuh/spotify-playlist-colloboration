function addPlaylistsToUser() {
    let select = M.FormSelect.getInstance(document.getElementById("playlist-select"));
    let selectValues = select.getSelectedValues();

    let valueList = [];
    for (let valueNumber in selectValues) {
        if (selectValues.hasOwnProperty(valueNumber)) {
            let value = selectValues[valueNumber];

            if (value !== "") {
                valueList.push(value)
            }
        }
    }

    if (valueList === []) {
        M.toast({html: "You did not select a playlist", colors: "red"});
        return
    }


    let sendValue = {};
    sendValue["playlists"] = valueList;

    let url_string = window.location.href;
    let url = new URL(url_string);
    sendValue["user-id"] = url.searchParams.get("user-id");

    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", addUserToPlaylistAPI, true);
    xhttp.setRequestHeader("Content-Type", "application/json");

    xhttp.onreadystatechange = function () {
        if (this.status === 200 && this.readyState === 4) {
            M.toast({html: "Success", classes: "green"});
            updatePlaylists(JSON.parse(this.responseText));
            updateSelect(JSON.parse(this.responseText))
        } else if (this.readyState === 4) {
            showErrorMessage(this)
        }
    };
    xhttp.send(JSON.stringify(sendValue))
}


function updatePlaylists(playlistJSON) {
    let root = document.getElementsByTagName("tbody")[0];

    if (document.getElementById("no-playlists-placeholder") !== null) {
        document.getElementById("no-playlists-placeholder").remove();
    }

    for (let playlistNumber in playlistJSON) {
        if (playlistJSON.hasOwnProperty(playlistNumber)) {
            let playlist = playlistJSON[playlistNumber];

            let playlistTr = document.createElement("tr");
            root.appendChild(playlistTr);

            let nameTd = document.createElement("td");
            playlistTr.appendChild(nameTd);

            let nameA = document.createElement("a");
            nameA.setAttribute("class", "pointer underline black-text playlist-name");
            nameA.innerText = playlist["name"];
            nameA.onclick = addOnclick(playlist["url"]);
            nameTd.appendChild(nameA);

            let idTd = document.createElement("td");
            idTd.innerText = playlist["id"];
            playlistTr.appendChild(idTd);

            let trackTd = document.createElement("td");
            trackTd.innerText = playlist["track_count"];
            playlistTr.appendChild(trackTd);

            let authorTd = document.createElement("td");
            playlistTr.appendChild(authorTd);

            let authorA = document.createElement("a");
            authorA.setAttribute("class", "pointer underline black-text playlist-name");
            authorA.innerText = playlist["author"]["name"];
            authorA.onclick = addOnclick(playlist["author"]["url"]);
            authorTd.appendChild(authorA);

            let deleteTd = document.createElement("td");
            playlistTr.appendChild(deleteTd);

            let deleteIcon = document.createElement("i");
            deleteIcon.setAttribute("class", "material-icons pointer primary-text-color");
            deleteIcon.innerText = "delete";
            deleteIcon.onclick = removePlaylistFromUser(playlistTr, playlist["id"], playlist["name"]);
            deleteTd.appendChild(deleteIcon);
        }
    }
}


function updateSelect(playlistJSON) {
    let select = document.getElementById("playlist-select");

    for (let playlistNumber in playlistJSON) {
        if (playlistJSON.hasOwnProperty(playlistNumber)) {

            let playlistID = playlistJSON[playlistNumber]["id"];
            let option = select.querySelector('[value="' + playlistID + '"]');
            option.remove()
        }
    }

    if (select.childElementCount === 1) {
        select.getElementsByTagName("option")[0].innerText = "No Playlists available";
    }

    M.FormSelect.init(select);
}