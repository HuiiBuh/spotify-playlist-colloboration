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
            songJSON["title"],
            songJSON["album"]["artist"]
        );

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


        if (type === "spotify-search") {
            var songDiv = document.createElement("li");
            songDiv.id = id;
            songDiv.setAttribute("class", "row flex-v-center song rounded add-song-list no-margin-left no-margin-right");
            songDiv.setAttribute("hover-on-touch", "");
            root.appendChild(songDiv);
        } else {
            var songDiv = document.createElement("div");
            songDiv.id = id;
            songDiv.setAttribute("class", "row flex-v-center song rounded add-song-list");
            songDiv.setAttribute("hover-on-touch", "");
            root.appendChild(songDiv);
        }
        let imageDiv = document.createElement("div");
        imageDiv.setAttribute("class", "col s2 m1 center flex-v-center song-cover-div");
        songDiv.appendChild(imageDiv);

        let image = document.createElement("img");
        image.setAttribute("alt", "cover");
        image.src = cover;
        imageDiv.appendChild(image);

        let informationDiv = document.createElement("div");
        informationDiv.setAttribute("class", "col s8 m10 to-long");
        songDiv.appendChild(informationDiv);

        let titleDiv = document.createElement("div");
        titleDiv.setAttribute("class", "s12 to-long");
        informationDiv.appendChild(titleDiv);

        let titleA = document.createElement("a");
        titleA.setAttribute("class", " pointer underline black-text no-wrap");
        titleA.setAttribute("hover-on-touch", "");
        titleA.innerText = title;
        titleA.onclick = addOnclick(url);
        titleDiv.appendChild(titleA);

        let restDiv = document.createElement("div");
        restDiv.setAttribute("class", "s12 to-long flex");
        informationDiv.appendChild(restDiv);

        artistList.forEach((artist, index) => {
            let interpretA = document.createElement("a");
            interpretA.setAttribute("class", "black-text pointer underline artist no-wrap to-long no-shrink");
            interpretA.setAttribute("hover-on-touch", "");
            interpretA.innerText = artist["name"];

            interpretA.onclick = addOnclick(artist["url"]);

            restDiv.appendChild(interpretA);

            // Append a ", " between the artists if it is not the last artist
            if (artistList.length > index + 1) {
                let artistSeparationA = document.createElement("a");
                artistSeparationA.setAttribute("class", "black-text small-padding-right artist-separator");
                artistSeparationA.innerText = ",";
                restDiv.appendChild(artistSeparationA)
            }
        });

        let albumArtistA = document.createElement("a");
        albumArtistA.setAttribute("class", "black-text pointer underline album-artist no-wrap to-long no-shrink");
        albumArtistA.setAttribute("hover-on-touch", "");
        albumArtistA.innerText = song.albumArtist["name"];
        albumArtistA.onclick = addOnclick(song.albumArtist["url"]);
        restDiv.appendChild(albumArtistA);


        let separationA = document.createElement("a");
        separationA.setAttribute("class", "black-text small-padding-right small-padding-left");
        separationA.innerHTML = "&bull;";
        restDiv.appendChild(separationA);

        let albumA = document.createElement("a");
        albumA.setAttribute("class", "black-text pointer underline no-wrap to-long");
        albumA.setAttribute("hover-on-touch", "");
        albumA.innerText = album["name"];
        albumA.onclick = addOnclick(album["url"]);

        restDiv.appendChild(albumA);

        if (type === "main" || type === "search") {
            let durationDiv = document.createElement("div");
            durationDiv.setAttribute("class", "col s2 m1");
            songDiv.appendChild(durationDiv);

            let durationP = document.createElement("p");
            durationP.innerText = durationHumanReadable;
            durationDiv.appendChild(durationP);
        } else if (type === "add") {
            let iconDiv = document.createElement("div");
            iconDiv.setAttribute("class", "col s2 m1 flex-v-center flex-end");
            songDiv.appendChild(iconDiv);

            let icon = document.createElement("i");
            icon.setAttribute("class", "material-icons pointer primary-text-color");
            icon.innerText = "delete";
            icon.onclick = deleteAddSong(song);
            iconDiv.appendChild(icon);
        } else if (type === "spotify-search") {
            let addPlaylistDiv = document.createElement("div");
            addPlaylistDiv.setAttribute("class", "col s2 m1 flex-end  flex-v-center");
            songDiv.appendChild(addPlaylistDiv);

            let addPlaylistIcon = document.createElement("i");
            addPlaylistIcon.setAttribute("class", "material-icons pointer");
            addPlaylistIcon.setAttribute("song-id", id);
            addPlaylistIcon.onclick = addToAddPlaylist(song);
            addPlaylistIcon.innerText = "playlist_add";
            addPlaylistDiv.appendChild(addPlaylistIcon);
        }
    });

    if (type === "main") {
        root.style.display = "block";
        document.getElementById("song-placeholder").style.display = "none";
    }

    //Update the hover on touch so every song gets picked up
    hoverOnTouch.reinitialise();
}
