/**
 * Add the playlist to the user
 */
function addPlaylistsToUser() {
    //Get the select of materialize
    let select = M.FormSelect.getInstance(document.getElementById("playlist-select"));
    //Get the values of the select
    let selectValues = select.getSelectedValues();

    //Filter the values
    let valueList = [];
    for (let valueNumber in selectValues) {
        if (!selectValues.hasOwnProperty(valueNumber)) continue;

        //Check if the value is != ""
        let value = selectValues[valueNumber];
        if (value !== "") {
            valueList.push(value)
        }
    }

    //CHeck if a playlist was selected
    if (valueList === []) {
        M.toast({html: "You did not select a playlist", colors: "bg-warning"});
        return
    }

    //Create the data of the request
    let requestData = {};
    requestData["playlists"] = valueList;

    //Get the user id from the url
    let url_string = window.location.href;
    let url = new URL(url_string);
    requestData["user-id"] = url.searchParams.get("user-id");


    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", addUserToPlaylistAPI, true);
    xhttp.setRequestHeader("Content-Type", "application/json");

    xhttp.onreadystatechange = function () {
        if (this.status === 200 && this.readyState === 4) {
            M.toast({html: "Success", classes: "bg-success"});
            displayPlaylists(JSON.parse(this.responseText));
            updateSelect(JSON.parse(this.responseText))
        } else if (this.readyState === 4) {
            showErrorMessage(this)
        }
    };
    xhttp.send(JSON.stringify(requestData))
}

/**
 * Update the playlists
 * @param playlistJSON The json of the playlist yo added
 */
function displayPlaylists(playlistJSON) {
    let root = document.getElementsByTagName("tbody")[0];

    //Remove the placeholder if there is one
    if (document.getElementById("no-playlists-placeholder") !== null) {
        document.getElementById("no-playlists-placeholder").remove();
    }

    //For every playlist display it
    for (let playlistNumber in playlistJSON) {
        if (playlistJSON.hasOwnProperty(playlistNumber)) {
            let playlist = playlistJSON[playlistNumber];

            let playlistTr = document.createElement("tr");
            root.appendChild(playlistTr);

            let nameTd = document.createElement("td");
            playlistTr.appendChild(nameTd);

            let nameA = document.createElement("a");
            nameA.setAttribute("class", "pointer underline black-text playlist-name");
            nameA.setAttribute("hover-on-touch", "");
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
            authorA.setAttribute("hover-on-touch", "");
            authorA.innerText = playlist["author"]["name"];
            authorA.onclick = addOnclick(playlist["author"]["url"]);
            authorTd.appendChild(authorA);

            let deleteTd = document.createElement("td");
            playlistTr.appendChild(deleteTd);

            let deleteIcon = document.createElement("i");
            deleteIcon.setAttribute("class", "material-icons pointer primary-text-color");
            deleteIcon.setAttribute("tabindex", "0");
            deleteIcon.innerText = "delete";
            deleteIcon.onclick = removePlaylistFromUser(playlistTr, playlist["id"], playlist["name"]);
            deleteIcon.onkeydown = function (event) {
                if (event.code === "Enter" || event.code === "NumpadEnter") {
                    removePlaylistFromUser(playlistTr, playlist["id"], playlist["name"])();
                }
            };
            deleteTd.appendChild(deleteIcon);
        }
        sort.refresh();
    }
}

/**
 * Remove the playlists that have been added to the user
 * @param playlistJSON The json of the playlists that have been added
 */
function updateSelect(playlistJSON) {
    let select = document.getElementById("playlist-select");

    //For every playlist
    for (let playlistNumber in playlistJSON) {
        if (!playlistJSON.hasOwnProperty(playlistNumber)) continue;

        //Try to get the playlist in the option by the value and remove it
        let playlistID = playlistJSON[playlistNumber]["id"];
        let option = select.querySelector('[value="' + playlistID + '"]');
        option.remove()
    }

    //Check if the user has every playlist available
    if (select.childElementCount === 1) {
        select.getElementsByTagName("option")[0].innerText = "No Playlists available";
    }

    //Reinit the select
    M.FormSelect.init(select);
}