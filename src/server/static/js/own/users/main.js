window.onload = function () {
    addEventHandler()

};


function addEventHandler() {

    let userList = document.getElementsByClassName("user");
    for (let userNumber in userList) {
        if (userList.hasOwnProperty(userNumber)) {
            let user = userList[userNumber];
            let deleteIcon = user.getElementsByClassName("material-icons")[1];

            deleteIcon.onclick = deleteUser(user, deleteIcon.id)
        }
    }

}

function deleteUser(userNode, userID) {
    return function () {
        let xhttp = new XMLHttpRequest();
        let url = deleteUserAPI + userID;

        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                userNode.remove();
                M.toast({html: "Successfully deleted spotify user", classes: "green"});
            } else if (this.readyState === 4) {
                showErrorMessage(this);
            }
        };

        xhttp.open("GET", url, true);
        xhttp.send();
    }
}