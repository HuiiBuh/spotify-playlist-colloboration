function toggleQueue() {

    let value = document.getElementById("playback-control").checked;

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {

        if (this.readyState === 4 && this.status === 200) {
            showSuccessMessage(this)
        } else if (this.readyState === 4 && this.status !== 200) {
            showErrorMessage(this)
        }
    };

    let url = playbackControlAPI + value.toString();

    xhttp.open("POST", url, true);
    xhttp.send();
}
