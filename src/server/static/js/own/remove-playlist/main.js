window.onload = function () {
    addEventHandler()

};

function addEventHandler() {
    document.getElementById("add-button").onclick = addPlaylist;

    let playlistList = document.getElementsByClassName("playlist");
    for (let playlistNumber in playlistList) {
        if (playlistList.hasOwnProperty(playlistNumber)) {
            let playlist = playlistList[playlistNumber];
            let deleteButton = playlist.getElementsByClassName("material-icons")[0];
            deleteButton.onclick = deletePlaylist(playlist, deleteButton.id);
        }
    }
}


function deletePlaylist(playlistNode, playlistID) {
    return function () {
        let xhttp = new XMLHttpRequest();
        let url = removePlaylistAPI + playlistID;

        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                playlistNode.remove();
                M.toast({html: "Successfully deleted the playlist", classes: "green"})
            }
        };

        xhttp.open("GET", url, true);
        xhttp.send();
    }
}

async function addPlaylist() {
    let playlistID = document.getElementById("playlist-id").value;

    if (playlistID === "" || /^ *$/.test(playlistID)) {
        return 0
    }

    addPlaylistToUser(playlistID)
}


function addPlaylistToUser(playlistID) {
    let xhttp = new XMLHttpRequest();
    let url = addPlaylistAPI + playlistID;

    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            M.toast({html: "Success", classes: "green"});
            displayNewPlaylist(JSON.parse(this.responseText));
            return
        } else if (this.readyState === 4) {
            let error_response = this.responseText;
            error_response = error_response.split("<p>")[1].replace("</p>", "");

            let toast_message = document.createElement("p");
            toast_message.innerText = error_response;

            M.toast({html: toast_message, classes: "red"})
        }
    };

    xhttp.open("GET", url, true);
    xhttp.send();
}

function displayNewPlaylist(json) {
    let root = document.getElementById("insert");

    let tr = document.createElement("tr");
    tr.setAttribute("class", "playlist");
    root.appendChild(tr);

    let name = document.createElement("td");
    name.innerText = json["name"];

    name.onclick = addOnclick(json["external_urls"]["spotify"]);
    tr.appendChild(name);

    let author = document.createElement("td");
    author.innerText = json["owner"]["display_name"];
    author.onclick = addOnclick(json["owner"]["external_urls"]["spotify"]);
    tr.appendChild(author);

    let trackCount = document.createElement("td");
    trackCount.innerText = json["tracks"]["total"];
    tr.appendChild(trackCount);

    let deleteTd = document.createElement("td");
    tr.appendChild(deleteTd);

    let deleteIcon = document.createElement("i");
    deleteIcon.setAttribute("class", "material-icons red-text pointer");
    deleteIcon.innerText = "delete";
    deleteIcon.id = json["id"];
    deleteIcon.onclick = deletePlaylist(tr, json["id"]);
    deleteTd.appendChild(deleteIcon);

    function addOnclick(url) {
        return function () {
            window.open(url)
        };
    }
}