/**
 * The playlist placeholder
 * @type {HTMLTableRowElement}
 */
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

/**
 * Remove the Playlist from the User
 * @param playlistNode The node of the playlist
 * @param playlistID The id of the playlist
 * @param name The name of the playlist
 * @returns {Function} The function that will be executed onclick
 */
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

        //Get the user id from the url
        let url_string = window.location.href;
        let url = new URL(url_string);
        let userID = url.searchParams.get("user-id");

        let requestData = {};
        requestData["user-id"] = userID;
        requestData["playlist-id"] = playlistID;


        xhttp.send(JSON.stringify(requestData));
    }
}

/**
 * Check if the table is empty and display the placeholders
 */
function checkIfTableIsEmpty() {
    let table = document.getElementsByTagName("tbody")[0];

    if (table.innerText === "") {
        table.appendChild(playlistPlaceholder);
    }
}

/**
 * Add the Playlist that has been removed to the select
 * @param playlistID The id of the playlist
 * @param name The name of the playlist
 */
function addPlaylistToSelect(playlistID, name) {
    let select = document.getElementById("playlist-select");

    //Update the placeholder of the select
    select.querySelectorAll("[disabled]")[0].innerText = "Select a Playlist";

    //Create a new option and append it to the select
    let option = document.createElement("option");
    option.setAttribute("value", playlistID);
    option.innerText = name;
    select.appendChild(option);

    //Reinit the select
    M.FormSelect.init(select);
}