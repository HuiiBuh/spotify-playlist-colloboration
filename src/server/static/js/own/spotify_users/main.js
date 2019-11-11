window.onload = function () {
    addEventHandler()
};

function addEventHandler() {

    let userList = document.getElementsByClassName("spotify-user");
    for (let userNumber in userList) {
        if (userList.hasOwnProperty(userNumber)) {
            let user = userList[userNumber];
            let deleteIcon = user.getElementsByClassName("material-icons")[1];

            deleteIcon.onclick = deleteSpotifyUser(user, deleteIcon.id);
            deleteIcon.onkeypress = function (evt) {
                if (evt.code === "Enter" || evt.code === "NumpadEnter") {
                    deleteSpotifyUser(user, deleteIcon.id)();
                }
            }
        }
    }
}

/**
 * The no user placeholder
 * @type {HTMLTableRowElement}
 */
let playlistPlaceholder = function () {
    let tr = document.createElement("tr");
    tr.id = "user-placeholder";

    tr.appendChild(document.createElement("td"));
    tr.appendChild(document.createElement("td"));

    let td = document.createElement("td");
    td.innerText = "No Users";
    tr.appendChild(td);

    tr.appendChild(document.createElement("td"));
    tr.appendChild(document.createElement("td"));
    tr.appendChild(document.createElement("td"));
    return tr;
}();

/**
 * Delete a spotify user
 * @param userNode The table row of the user
 * @param userID The user id
 * @returns {Function} The function that will be executed onclick
 */
function deleteSpotifyUser(userNode, userID) {
    return function () {
        let xhttp = new XMLHttpRequest();
        let url = deleteSpotifyUserAPI + userID;

        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                userNode.remove();
                checkIfTableIsEmpty();
                M.toast({html: "Successfully deleted spotify user", classes: "bg-success"});
            } else if (this.readyState === 4) {
                showErrorMessage(this);
            }
        };

        xhttp.open("GET", url, true);
        xhttp.send();
    }
}

/**
 * Check if the table is empty and append the placeholder if this is the case
 */
function checkIfTableIsEmpty() {
    let body = document.getElementsByTagName("tbody")[0];

    if (body.innerText === "") {
        body.appendChild(playlistPlaceholder);
    }
}