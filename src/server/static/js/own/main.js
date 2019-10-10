M.AutoInit();

//ToDo Noch jede api schnittstellt mit globaler variable mit flask deklarieren

window.onload = function () {
    getPlaylistInfo("/api/spotify/playlist");
    getPlaylistSongInfo("/api/spotify/playlist/tracks");
};


function getPlaylistSongInfo(url) {
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            displayPlaylistSongs(JSON.parse(this.responseText))
        }
    };

    xhttp.open("GET", url, true);
    xhttp.send();
}

function getPlaylistInfo(url) {
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            displayPlaylistInfo(JSON.parse(this.responseText))
        }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
}

function displayPlaylistInfo(playlistJson) {

    document.getElementById("playlist-name").innerText = playlistJson["name"];
    document.getElementById("author").innerText = playlistJson["author"]["name"];
    document.getElementById("author").onclick = function () {
        window.open(playlistJson["author"]["url"])
    };
    document.getElementById("duration").innerText = "Not implemented yet.";
    document.getElementById("song-count").innerText = playlistJson["track_count"];
    document.getElementById("playlist-url").onclick = function () {
        window.open(playlistJson["url"])
    };

    document.getElementById("playlist-cover").style.background = 'url(' + playlistJson["image_url"] + ')';


    let trash = document.createElement("img");
    trash.src = playlistJson["image_url"];
    trash.style.display = "none";
    document.getElementById("playlist-cover").appendChild(trash);
    trash.onload = function () {
        this.remove();
        document.getElementById("playlist-cover").classList.remove("loading");
    }


}

function displayPlaylistSongs(songList) {

    let root = document.getElementById("playlist-songs");

    for (let songId in songList) {
        let song = document.createElement("div");
        song.setAttribute("class", "row flex-v-center song rounded add-song-list");
        root.appendChild(song);

        let imageDiv = document.createElement("div");
        imageDiv.setAttribute("class", "col xs3 s2 l1 flex-v-center");
        song.appendChild(imageDiv);

        let image = document.createElement("img");
        image.setAttribute("alt", "cover");
        image.src = songList[songId]["image_url"];
        imageDiv.appendChild(image);

        let informationDiv = document.createElement("div");
        informationDiv.setAttribute("class", "col xs8 s9 l10");
        song.appendChild(informationDiv);

        let titleDiv = document.createElement("div");
        titleDiv.setAttribute("class", "s12");
        informationDiv.appendChild(titleDiv);

        let titleA = document.createElement("a");
        titleA.setAttribute("class", " pointer underline black-text");
        titleA.innerText = songList[songId]["title"];
        titleA.onclick = function () {
            window.open(songList[songId]["url"])
        };
        titleDiv.appendChild(titleA);

        for (let artist in songList[songId]["artists"]) {
            let interpretA = document.createElement("a");
            interpretA.setAttribute("class", "black-text pointer underline");
            interpretA.innerText = songList[songId]["artists"][artist]["name"];

            interpretA.onclick = function () {
                window.open(songList[songId]["artists"][artist]["url"])
            };

            informationDiv.appendChild(interpretA);

            if (songList[songId]["artists"].length > parseInt(artist) + 1) {
                let artistSeparationA = document.createElement("a");
                artistSeparationA.setAttribute("class", "black-text small-padding-right");
                artistSeparationA.innerText = ",";
                informationDiv.appendChild(artistSeparationA)
            }
        }

        let separationA = document.createElement("a");
        separationA.setAttribute("class", "black-text small-padding-right small-padding-left");
        separationA.innerHTML = "&bull;";
        informationDiv.appendChild(separationA);

        let albumA = document.createElement("a");
        albumA.setAttribute("class", "black-text pointer underline");
        albumA.innerText = songList[songId]["album"]["name"];
        albumA.onclick = function () {
            window.open(songList[songId]["album"]["url"])
        };
        informationDiv.appendChild(albumA);

        let durationDiv = document.createElement("div");
        durationDiv.setAttribute("class", "col xs1 s1");
        song.appendChild(durationDiv);

        let durationP = document.createElement("p");
        durationP.innerText = songList[songId]["duration"];
        durationDiv.appendChild(durationP)
    }
}