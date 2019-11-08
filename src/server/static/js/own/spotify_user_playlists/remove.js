/**
 * Delete the playlist
 * @param playlistNode The row of the playlist
 * @param playlistID The id of the playlist
 * @returns {Function} The function that will be executed
 */
function deletePlaylist(playlistNode, playlistID) {
    return function () {
        let xhttp = new XMLHttpRequest();
        let url = removePlaylistAPI + playlistID;

        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                playlistNode.remove();
                checkIfTableIsEmpty();
                M.toast({html: "Successfully deleted the playlist", classes: "bg-success"})
            }
        };

        xhttp.open("GET", url, true);
        xhttp.send();
    }
}

/**
 * Check if the table is empty and append the placeholder to it
 */
function checkIfTableIsEmpty() {
    let table = document.getElementsByTagName("tbody")[0];

    if (table.innerText === "") {
        table.appendChild(playlistPlaceholder);
    }
}

/**
 * The playlist placeholder
 * @type {HTMLTableRowElement}
 */
let playlistPlaceholder = function () {
    let tr = document.createElement("tr");
    tr.id = "no-playlists-placeholder";

    tr.appendChild(document.createElement("td"));

    let td = document.createElement("td");
    td.setAttribute("class", "center-align");
    td.innerText = "No Playlists";
    tr.appendChild(td);

    tr.appendChild(document.createElement("td"));
    tr.appendChild(document.createElement("td"));
    return tr;
}();