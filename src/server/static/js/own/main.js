M.AutoInit();


document.getElementById("playlist-title").onclick = function () {
    let url = "/api/v1/spotify/playlist/tracks";
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            displayPlaylist(JSON.parse(this.responseText))
        }
    };

    xhttp.open("GET", url, true);
    xhttp.send();
};


function displayPlaylist(songList) {

    console.log(songList);

    for (let songId in songList) {

        if (songList.hasOwnProperty(songId)) {
            let name = songList[songId]["name"]
            let album = songList[songId]["name"]
            let duration = songList[songId]["name"]
            let artist = songList[songId]["name"]
            console.log(song)
        }
    }


}