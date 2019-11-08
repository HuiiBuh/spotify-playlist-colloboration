window.onload = function () {
    addEventHandler()
};

function addEventHandler() {
    //Get all users
    let userList = document.getElementsByClassName("user");
    //For every user

    for (let userID in userList) {
        if (!userList.hasOwnProperty(userID)) continue;

        // Add a event on the delete icon
        let user = userList[userID];
        let deleteIcon = user.getElementsByClassName("material-icons")[1];
        deleteIcon.onclick = deleteUser(user, deleteIcon.id)

    }
}

/**
 * Delete the user
 * @param userNode The node of the user row
 * @param userID The user id
 * @returns {Function} The function that will be executed onclick
 */
function deleteUser(userNode, userID) {
    return function () {

        let xhttp = new XMLHttpRequest();
        let url = deleteUserAPI + userID;

        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                userNode.remove();
                M.toast({html: "Successfully deleted spotify user", classes: "bg-success"});
            } else if (this.readyState === 4) {
                showErrorMessage(this);
            }
        };

        xhttp.open("GET", url, true);
        xhttp.send();
    }
}