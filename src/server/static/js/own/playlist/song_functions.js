/**
 * Get the playlist song JSON
 */
function getPlaylistSongs() {
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            jsonToSongList(JSON.parse(this.responseText), "main")
        } else if (this.readyState === 4 && this.status !== 200) {
            M.toast({html: "The tracks could not be loaded", classes: "bg-warning"})
        }
    };

    xhttp.open("GET", playlistTracksAPI, true);
    xhttp.send();
}

/**
 * Create song objects from json
 * @param json The json with the song objects
 * @param type "main" for the main playlist
 * @param appendList The list the songs are supposed to be appended to
 * @returns {[]|Array}
 */
function jsonToSongList(json, type, appendList = []) {

    //Loop through the json and create the songs
    for (let songId in json) {
        if (!json.hasOwnProperty(songId)) continue;

        let songJSON = json[songId];


        let song = new Song(
            songId,
            songJSON["album"],
            songJSON["url"],
            songJSON["artists"],
            songJSON["duration"],
            songJSON["cover"],
            songJSON["title"]);

        if (type === "main")
            mainPlaylist.addSong(song);
        else
            appendList.push(song);
    }

    if (type === "main")
        displayPlaylistSongs("playlist-songs", mainPlaylist.songList, "main");
    else
        return appendList
}

/**
 * Display the songs in the main playlist
 * @param rootID The root the songs get appended to
 * @param songList A list of songs
 * @param type main or search
 */
function displayPlaylistSongs(rootID, songList, type) {
    let root = document.getElementById(rootID);

    songList.forEach(song => {
        let {cover, title, url, artist: artistList, album, durationHumanReadable, id} = song;

        let songDiv = document.createElement("div");
        songDiv.id = id;
        songDiv.setAttribute("class", "row flex-v-center song rounded add-song-list");
        songDiv.setAttribute("hover-on-touch", "");
        root.appendChild(songDiv);

        let imageDiv = document.createElement("div");
        imageDiv.setAttribute("class", "col xs3 s2 l1 center flex-v-center song-cover-div");
        songDiv.appendChild(imageDiv);

        let image = document.createElement("img");
        image.setAttribute("alt", "cover");
        image.src = cover;
        imageDiv.appendChild(image);

        let informationDiv = document.createElement("div");
        informationDiv.setAttribute("class", "col xs8 s9 l10");
        songDiv.appendChild(informationDiv);

        let titleDiv = document.createElement("div");
        titleDiv.setAttribute("class", "s12");
        informationDiv.appendChild(titleDiv);

        let titleA = document.createElement("a");
        titleA.setAttribute("class", " pointer underline black-text");
        titleA.setAttribute("hover-on-touch", "");
        titleA.innerText = title;
        titleA.onclick = addOnclick(url);
        titleDiv.appendChild(titleA);

        artistList.forEach((artist, index) => {
            let interpretA = document.createElement("a");
            interpretA.setAttribute("class", "black-text pointer underline");
            interpretA.setAttribute("hover-on-touch", "");
            interpretA.innerText = artist["name"];

            interpretA.onclick = addOnclick(artist["url"]);

            informationDiv.appendChild(interpretA);

            // Append a ", " between the artists if it is not the last artist
            if (artistList.length > index + 1) {
                let artistSeparationA = document.createElement("a");
                artistSeparationA.setAttribute("class", "black-text small-padding-right");
                artistSeparationA.innerText = ",";
                informationDiv.appendChild(artistSeparationA)
            }
        });

        let separationA = document.createElement("a");
        separationA.setAttribute("class", "black-text small-padding-right small-padding-left");
        separationA.innerHTML = "&bull;";
        informationDiv.appendChild(separationA);

        let albumA = document.createElement("a");
        albumA.setAttribute("class", "black-text pointer underline");
        albumA.setAttribute("hover-on-touch", "");
        albumA.innerText = album["name"];
        albumA.onclick = addOnclick(album["url"]);

        informationDiv.appendChild(albumA);

        let durationDiv = document.createElement("div");
        durationDiv.setAttribute("class", "col xs1 s1");
        songDiv.appendChild(durationDiv);

        let durationP = document.createElement("p");
        durationP.innerText = durationHumanReadable;
        durationDiv.appendChild(durationP);
    });

    if (type === "main") {
        root.style.display = "block";
        document.getElementById("song-placeholder").style.display = "none";
    }

    //Update the hover on touch so every song gets picked up
    hoverOnTouch.reinitialise();
}
