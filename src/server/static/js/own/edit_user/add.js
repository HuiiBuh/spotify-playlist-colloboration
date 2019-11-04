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
            updatePlaylists();
        } else if (this.readyState === 4) {
            showErrorMessage(this)
        }
    };
    xhttp.send(JSON.stringify(sendValue))
}


function updatePlaylists() {

}