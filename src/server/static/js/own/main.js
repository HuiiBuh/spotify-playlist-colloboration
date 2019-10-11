let mainPlaylist = null;


document.getElementById("loading-playlist-description").style.height = document.getElementById("playlist-cover").offsetHeight + "px";
M.AutoInit();


window.onload = function () {
    getPlaylistInfo("/api/spotify/playlist");
    getPlaylistSongs("/api/spotify/playlist/tracks");
};


function getPlaylistInfo(url) {
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            createPlaylistFromJSON(JSON.parse(this.responseText));
            displayPlaylistInfo(true);
        }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
}


function createPlaylistFromJSON(json) {
    let playlistName = json["name"];
    let author = [json["author"]["name"], json["author"]["url"]];
    let songCount = json["track_count"];
    let url = json["url"];
    let cover = json["image_url"];

    mainPlaylist = new Playlist(playlistName, author, songCount, url, cover, "main")
}


function displayPlaylistInfo(first) {

    document.getElementById("playlist-name").innerText = mainPlaylist.name;
    document.getElementById("author").innerText = mainPlaylist.author[0];
    document.getElementById("author").onclick = function () {
        window.open(mainPlaylist.author[1])
    };
    document.getElementById("duration").innerText = mainPlaylist.duration;
    document.getElementById("song-count").innerText = mainPlaylist.songCount;
    document.getElementById("playlist-url").onclick = function () {
        window.open(mainPlaylist.url)
    };

    document.getElementById("playlist-cover").style.background = 'url(' + mainPlaylist.picture + ')';

    function updatePlaceholder() {
        let trash = document.createElement("img");
        trash.src = mainPlaylist.picture;
        trash.style.display = "none";
        document.getElementById("playlist-cover").appendChild(trash);
        trash.onload = function () {
            this.remove();
            document.getElementById("playlist-cover").classList.remove("loading");

            document.getElementById("loading-playlist-description").style.display = "none";
            document.getElementById("playlist-description").style.display = "table";

            document.getElementById("loading-heading").style.display = "none";
            document.getElementById("playlist-name").style.display = "block";
        }
    }

    if (first) {
        updatePlaceholder()
    }
}


function getPlaylistSongs(url) {
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            createSongs(JSON.parse(this.responseText))
        }
    };

    xhttp.open("GET", url, true);
    xhttp.send();
}

function createSongs(json) {
    for (let songId in json) {
        if (json.hasOwnProperty(songId))
            var songJSON = json[songId];

        let title = songJSON["title"];
        let cover = songJSON["cover"];
        let url = songJSON["url"];
        let album = songJSON["album"];
        let artists = songJSON["artists"];
        let duration = songJSON["duration"];

        let song = new Song(songId, album, url, artists, duration, cover, title);

        mainPlaylist.addSong(song)
    }
    displayPlaylistSongs()
}


function displayPlaylistSongs() {

    let root = document.getElementById("playlist-songs");


    for (let songNumber in mainPlaylist.songList) {
        if (mainPlaylist.songList.hasOwnProperty(songNumber)) {
            var {cover, title, url, artist, album, durationHumanReadable} = mainPlaylist.songList[songNumber];
        }

        let song = document.createElement("div");
        song.setAttribute("class", "row flex-v-center song rounded add-song-list");
        root.appendChild(song);

        let imageDiv = document.createElement("div");
        imageDiv.setAttribute("class", "col xs3 s2 l1 center flex-v-center song-cover-div");
        song.appendChild(imageDiv);

        let image = document.createElement("img");
        image.setAttribute("alt", "cover");
        image.src = cover;
        imageDiv.appendChild(image);

        let informationDiv = document.createElement("div");
        informationDiv.setAttribute("class", "col xs8 s9 l10");
        song.appendChild(informationDiv);

        let titleDiv = document.createElement("div");
        titleDiv.setAttribute("class", "s12");
        informationDiv.appendChild(titleDiv);

        let titleA = document.createElement("a");
        titleA.setAttribute("class", " pointer underline black-text");
        titleA.innerText = title;
        titleA.onclick = addOnclick(url);
        titleDiv.appendChild(titleA);

        for (let singleArtist in artist) {
            if (artist.hasOwnProperty(singleArtist)) {
                var singleArtistObject = artist[singleArtist];
            }
            let interpretA = document.createElement("a");
            interpretA.setAttribute("class", "black-text pointer underline");
            interpretA.innerText = singleArtistObject["name"];

            interpretA.onclick = addOnclick(singleArtistObject["url"]);

            informationDiv.appendChild(interpretA);

            if (artist.length > parseInt(singleArtist) + 1) {
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
        albumA.innerText = album["name"];
        albumA.onclick = addOnclick(album["url"]);

        informationDiv.appendChild(albumA);

        let durationDiv = document.createElement("div");
        durationDiv.setAttribute("class", "col xs1 s1");
        song.appendChild(durationDiv);

        let durationP = document.createElement("p");
        durationP.innerText = durationHumanReadable;
        durationDiv.appendChild(durationP);

        function addOnclick(onclick_url) {
            let url = onclick_url;
            return function () {
                window.open(url)
            }
        }
    }

    root.style.display = "block";
    document.getElementById("song-placeholder").style.display = "none"
}

function updatePlaylistInfo() {
    document.getElementById("song-count").innerText = mainPlaylist.songCount;
    document.getElementById("duration").innerText = mainPlaylist.durationHumanReadable;
}