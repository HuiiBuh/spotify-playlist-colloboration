function startPlaybackSync() {
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            updateCurrentlyPlaying(JSON.parse(this.responseText))
        } else if (this.readyState === 4) {
            showErrorMessage(this);
        }
    };


    xhttp.open("GET", playerAPI, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send();
}

function updateCurrentlyPlaying(json) {
    let song = json["item"];
    let cover = "/proxy/" + song["album"]["images"][0]["url"];

    let album = {
        "name": song["album"]["name"],
        "url": song["album"]["external_urls"]["spotify"]
    };
    let artist = {
        "name": song["artists"][0]["name"],
        "url": song["artists"][0]["external_urls"]["spotify"]
    };
    let title = {
        "name": song["name"],
        "url": song["external_urls"]["spotify"]
    };

    let temp = document.createElement("img");
    temp.src = cover;
    temp.onload = function () {
        document.getElementsByClassName("cover-image")[0].src = cover;
        updateBackground();
    }
}
