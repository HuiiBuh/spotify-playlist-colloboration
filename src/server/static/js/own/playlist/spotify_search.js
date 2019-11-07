let addTimeouts = null;
let addPlaylist = new Playlist("main", "web", 0, null, null, "add");

function songSearch(evt) {
    // Clear timeout
    if (addTimeouts) {
        clearTimeout(addTimeouts);
    }

    // Get the search value and clean it
    let searchValue = evt.currentTarget.value;
    searchValue = cleanForRegex(searchValue);

    // Check if the search value is valid
    if (/^\s*$/g.test(searchValue) || searchValue === "") {
        document.getElementById("search-preview").innerText = "";
        return
    }

    // Get the search results with a api call
    addTimeouts = setTimeout(function () {

        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {

            if (this.readyState === 4 && this.status === 200) {
                let songList = jsonToSongList(JSON.parse(this.responseText), "search");
                displaySearchPreview(songList, "search-preview");
            } else if (this.readyState === 4 && this.status !== 200) {
                M.toast({html: "No songs could be retrieved from spotify", classes: "bg-warning"})
            }
        };

        let url = searchAPI + searchValue;
        xhttp.open("GET", url, true);
        xhttp.send();

    }, 200);
}

/**
 * Display the search results
 * @param searchSongList The song onjects
 * @param rootID The id the songs are supposed to be added to
 */
function displaySearchPreview(searchSongList, rootID) {
    let root = document.getElementById(rootID);
    root.innerText = "";

    //Foreach song in the json
    searchSongList.forEach(song => {
        let {cover, title, url, artist: artistList, album, id} = song;

        let songLi = document.createElement("li");
        songLi.setAttribute("class", "search-song flex-v-center small-padding-bottom small-padding-top");
        root.appendChild(songLi);

        let coverDiv = document.createElement("div");
        coverDiv.setAttribute("class", "col xs3 s2 l1 flex-v-center");
        songLi.appendChild(coverDiv);

        let coverImage = document.createElement("img");
        coverImage.setAttribute("class", "search-song-image no-padding");
        coverImage.src = cover;
        coverDiv.appendChild(coverImage);

        let infoDiv = document.createElement("div");
        infoDiv.setAttribute("class", "col xs8 s9 m9 l10");
        songLi.appendChild(infoDiv);

        let titleDiv = document.createElement("div");
        titleDiv.setAttribute("class", "s12");
        infoDiv.appendChild(titleDiv);

        let titleA = document.createElement("a");
        titleA.setAttribute("class", "pointer underline black-text");
        titleA.setAttribute("hover-on-touch", "");
        titleA.onclick = addOnclick(url);
        titleA.innerText = title;
        titleDiv.appendChild(titleA);

        artistList.forEach((artist, index) => {
            let artistA = document.createElement("a");
            artistA.setAttribute("class", "pointer underline black-text");
            artistA.setAttribute("hover-on-touch", "");
            artistA.onclick = addOnclick(artist["url"]);
            artistA.innerText = artist["name"];
            infoDiv.appendChild(artistA);

            if (artistList.length > index + 1) {
                let artistSeparationA = document.createElement("a");
                artistSeparationA.setAttribute("class", "black-text small-padding-right");
                artistSeparationA.innerText = ",";
                infoDiv.appendChild(artistSeparationA)
            }
        });

        let dividerA = document.createElement("a");
        dividerA.setAttribute("class", "black-text small-padding-right small-padding-left");
        dividerA.innerHTML = "&middot;";
        infoDiv.appendChild(dividerA);

        let albumA = document.createElement("a");
        albumA.setAttribute("class", "pointer underline black-text");
        albumA.setAttribute("hover-on-touch", "");
        albumA.onclick = addOnclick(album["url"]);
        albumA.innerText = album["name"];
        infoDiv.appendChild(albumA);

        let addPlaylistDiv = document.createElement("div");
        addPlaylistDiv.setAttribute("class", "col xs1 s2 m2 l1 flex-end  flex-v-center");
        songLi.appendChild(addPlaylistDiv);

        let addPlaylistIcon = document.createElement("i");
        addPlaylistIcon.setAttribute("class", "material-icons pointer");
        addPlaylistIcon.setAttribute("song-id", id);
        addPlaylistIcon.onclick = addToAddPlaylist(song);
        addPlaylistIcon.innerText = "playlist_add";
        addPlaylistDiv.appendChild(addPlaylistIcon);
    });
}

/**
 * Create the songs and check if the song is already in the playlist
 * @param song The song that is supposed to be added to the add playlist
 * @returns {Function} The function that will be called if the add song to playlist button is pressed
 */
function addToAddPlaylist(song) {

    return function (evt) {
        let add = true;
        [mainPlaylist.songList, addPlaylist.songList].forEach(playlist => {
            playlist.forEach(playlistSong => {
                let artistSearch = "";
                song.artist.forEach(artist => {
                    artistSearch += artist["name"];
                });

                let artistRegex = new RegExp(cleanForRegex(artistSearch), "gi");
                let titleRegex = new RegExp(cleanForRegex(song.title), "gi");
                let albumRegex = new RegExp(cleanForRegex(song.album), "gi");

                let playlistSongSearchString = playlistSong.searchString;
                if (artistRegex.test(playlistSongSearchString) && titleRegex.test(playlistSongSearchString) && albumRegex.test(playlistSongSearchString)) {
                    add = false;
                }
            });
        });
        if (add) {
            evt.currentTarget.classList.add("success");
            addPlaylist.addSong(song);
            displayAddSongPlaylist(song, "add-song-list");
        } else {
            M.toast({html: "The Song already exists in the playlist", classes: "bg-warning"});
        }
    }
}

/**
 * Displays the songs that are supposed to be added
 * @param songObject The song object that is added
 * @param rootID The root ID the song is added to
 */
function displayAddSongPlaylist(songObject, rootID) {
    let root = document.getElementById(rootID);

    let songDiv = document.createElement('div');
    songDiv.setAttribute("class", "row flex-v-center song rounded add-song-list");
    songDiv.setAttribute("hover-on-touch", "");
    root.appendChild(songDiv);

    let imageDiv = document.createElement("div");
    imageDiv.setAttribute("class", "col xs3 s2 l1 flex-v-center");
    songDiv.appendChild(imageDiv);

    let image = document.createElement("img");
    image.setAttribute("class", "song-image no-padding");
    image.src = songObject.cover;
    imageDiv.appendChild(image);

    let infoDiv = document.createElement("div");
    infoDiv.setAttribute("class", "col xs8 s9 l9");
    songDiv.appendChild(infoDiv);

    let titleDiv = document.createElement("div");
    titleDiv.setAttribute("class", "s12 black-text pointer underline");
    titleDiv.setAttribute("hover-on-touch", "");
    titleDiv.innerText = songObject.title;
    titleDiv.onclick = addOnclick(songObject.url);
    infoDiv.appendChild(titleDiv);

    songObject.artist.forEach((artist, index) => {
        let interpretA = document.createElement("a");
        interpretA.setAttribute("class", "black-text pointer underline");
        interpretA.setAttribute("hover-on-touch", "");
        interpretA.innerText = artist["name"];
        interpretA.onclick = addOnclick(artist["url"]);
        infoDiv.appendChild(interpretA);

        if (songObject.artist.length > index + 1) {
            let artistSeparationA = document.createElement("a");
            artistSeparationA.setAttribute("class", "black-text small-padding-right");
            artistSeparationA.innerText = ",";
            infoDiv.appendChild(artistSeparationA)
        }
    });

    let dividerA = document.createElement("a");
    dividerA.setAttribute("class", "black-text small-padding-right small-padding-left");
    dividerA.innerHTML = "&middot;";
    infoDiv.appendChild(dividerA);

    let albumA = document.createElement("a");
    albumA.setAttribute("class", "black-text pointer underline");
    albumA.setAttribute("hover-on-touch", "");
    albumA.innerText = songObject.album["name"];
    albumA.onclick = addOnclick(songObject.album["url"]);
    infoDiv.appendChild(albumA);

    let iconDiv = document.createElement("div");
    iconDiv.setAttribute("class", "col xs1 s2 flex-v-center flex-end");
    songDiv.appendChild(iconDiv);

    let icon = document.createElement("i");
    icon.setAttribute("class", "material-icons pointer primary-text-color");
    icon.innerText = "delete";
    icon.onclick = deleteAddSong(songObject);
    iconDiv.appendChild(icon);

    hoverOnTouch.reinitialise();
}

function deleteAddSong(song) {
    return function (evt) {
        evt.target.parentElement.parentElement.remove();
        addPlaylist.removeSong(song)
    }

}

/**
 * Add the songs to the Spotify playlist with an api call
 */
function addSongsToPlaylist() {

    //Fill all song ids in one list
    let songList = [];
    addPlaylist.songList.forEach(song => {
        songList.push(song.id);
    });


    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", playlistAddTracksAPI, true);

    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 201) {

            //Display the songs in the playlist
            displayPlaylistSongs("playlist-songs", addPlaylist.songList, "main");

            //Add the songs to the main playlist
            addPlaylist.songList.forEach(song => {
                mainPlaylist.addSong(song);
            });

            //Clear the addSongs playlist preview
            document.getElementById("add-song-list").innerText = "";
            addPlaylist = new Playlist("main", "web", 0, null, null, "add")
        } else if (this.readyState === 4 && this.status !== 200) {
            M.toast({html: "An error occurred <br> The tracks could not bea added", classes: "bg-warning"})
        }
    };

    // Create the json for the request body
    let bodyData = {};
    bodyData["track-list"] = songList;

    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(bodyData));
}