function deletePlaylist(playlistNode, playlistID) {
    return function () {
        let xhttp = new XMLHttpRequest();
        let url = removePlaylistAPI + playlistID;

        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                playlistNode.remove();
                checkIfTableIsEmpty();
                M.toast({html: "Successfully deleted the playlist", classes: "green"})
            }
        };

        xhttp.open("GET", url, true);
        xhttp.send();
    }
}


function checkIfTableIsEmpty() {
    let table = document.getElementsByTagName("tbody")[0];


    if (table.innerText === "") {

        table.appendChild(playlistPlaceholder);

    }
}

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