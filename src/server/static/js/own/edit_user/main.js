window.onload = function () {

    addEventHandler()
};


function addPlaylistsToUser() {
    let select = M.FormSelect.getInstance(document.getElementById("playlist-select"));
    let selectValues = select.getSelectedValues();

    
}

function addEventHandler() {
    document.getElementById("add-playlist").onclick = addPlaylistsToUser
}