let addTimeouts = null;
let addPlaylist = new Playlist("main", "web", 0, null, null, "add")

function songSearch(evt) {
    // Clear timeout
    if (addTimeouts) {
        clearTimeout(addTimeouts);
    }

    // Get the search value
    let searchValue = evt.currentTarget.value;
    // Remove invalid singns
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
                let songList = createSongs(JSON.parse(this.responseText), type = "search");
                displaySearchPreview(songList, "search-preview");
            }
        };
        let url = searchAPI + searchValue;

        xhttp.open("GET", url, true);
        xhttp.send();

    }, 200);
}

/**
 * Display the search results
 * @param searchSongList The songs in json
 * @param rootID The id the songs are supposed to be added to
 */
function displaySearchPreview(searchSongList, rootID) {
    let root = document.getElementById(rootID);
    root.innerText = "";

    for (let songNumber in searchSongList) {
        let {cover, title, url, artist, album, id} = searchSongList[songNumber];

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
        titleA.onclick = addOnclick(url);
        titleA.innerText = title;
        titleDiv.appendChild(titleA);


        for (let artistNumber in artist) {
            let artistA = document.createElement("a");
            artistA.setAttribute("class", "pointer underline black-text");
            artistA.innerText = artist[artistNumber]["name"];
            infoDiv.appendChild(artistA);

            if (artist.length > parseInt(artistNumber) + 1) {
                let artistSeparationA = document.createElement("a");
                artistSeparationA.setAttribute("class", "black-text small-padding-right");
                artistSeparationA.innerText = ",";
                infoDiv.appendChild(artistSeparationA)
            }

        }

        let dividerA = document.createElement("a");
        dividerA.setAttribute("class", "black-text small-padding-right small-padding-left");
        dividerA.innerHTML = "&middot;";
        infoDiv.appendChild(dividerA);

        let albumA = document.createElement("a");
        albumA.setAttribute("class", "pointer underline black-text");
        albumA.innerText = album["name"];
        infoDiv.appendChild(albumA);

        let addPlaylistDiv = document.createElement("div");
        addPlaylistDiv.setAttribute("class", "col xs1 s2 m2 l1 flex-end  flex-v-center");
        songLi.appendChild(addPlaylistDiv);

        let addPlaylistIcon = document.createElement("i");
        addPlaylistIcon.setAttribute("class", "material-icons pointer");
        addPlaylistIcon.setAttribute("song-id", id);
        addPlaylistIcon.onclick = addToAddPlaylist(searchSongList[songNumber]);
        addPlaylistIcon.innerText = "playlist_add";
        addPlaylistDiv.appendChild(addPlaylistIcon);
    }

    function addOnclick(onclick_url) {
        let url = onclick_url;
        return function () {
            window.open(url)
        }
    }
}

/**
 * Create the songs and check if the song is already in the playlist
 * @param song The song that is supposed to be added to the add playlist
 * @returns {Function} The function that will be called if the add song to playlist button is pressed
 */
function addToAddPlaylist(song) {

    let songObject = song;
    return function (evt) {

        let songList = mainPlaylist.songList;
        for (let song in songList) {

            if (songList.hasOwnProperty(song))
                song = songList[song];

            let artists = songObject.artist;
            let artistSearch = "";
            for (let artistNumber in artists) {
                if (artists.hasOwnProperty(artistNumber))
                    artistSearch += artists[artistNumber]["name"];
            }

            let artistRegex = new RegExp(cleanForRegex(artistSearch), "gi");
            let titleRegex = new RegExp(cleanForRegex(songObject.title), "gi");
            let albumRegex = new RegExp(cleanForRegex(songObject.album), "gi");

            if (artistRegex.test(song.searchString) && titleRegex.test(song.searchString) && albumRegex.test(song.searchString)) {
                let toastHTML = '<p style="text-align: center; width:100%">The Song already exists in the playlist</p>';
                M.toast({html: toastHTML});
                return
            }
        }

        evt.currentTarget.style.color = "green";

        addPlaylist.addSong(songObject);
        displayAddSongPlaylist(songObject, "add-song-list");

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
    titleDiv.innerText = songObject.title;
    titleDiv.onclick = addOnclick(songObject.url);
    infoDiv.appendChild(titleDiv);

    for (let artistNumber in songObject.artist) {
        let artist = songObject.artist[artistNumber];

        let interpretA = document.createElement("a");
        interpretA.setAttribute("class", "black-text pointer underline");
        interpretA.innerText = artist["name"];
        interpretA.onclick = addOnclick(artist["url"]);
        infoDiv.appendChild(interpretA);

        if (songObject.artist.length > parseInt(artistNumber) + 1) {
            let artistSeparationA = document.createElement("a");
            artistSeparationA.setAttribute("class", "black-text small-padding-right");
            artistSeparationA.innerText = ",";
            infoDiv.appendChild(artistSeparationA)
        }
    }

    let dividerA = document.createElement("a");
    dividerA.setAttribute("class", "black-text small-padding-right small-padding-left");
    dividerA.innerHTML = "&middot;";
    infoDiv.appendChild(dividerA);

    let albumA = document.createElement("a");
    albumA.setAttribute("class", "black-text pointer underline");
    albumA.innerText = songObject.album["name"];
    albumA.onclick = addOnclick(songObject.album["url"]);
    infoDiv.appendChild(albumA);

    let iconDiv = document.createElement("div");
    iconDiv.setAttribute("class", "col xs1 s2 flex-v-center flex-end");
    songDiv.appendChild(iconDiv);

    let icon = document.createElement("i");
    icon.setAttribute("class", "material-icons pointer");
    icon.innerText = "delete";
    icon.onclick = deleteAddSong(songObject);
    iconDiv.appendChild(icon);

    function addOnclick(onclick_url) {
        let url = onclick_url;
        return function () {
            window.open(url)
        };
    }
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

    let songList = [];

    // Create the id list
    let songObjectList = addPlaylist.songList;
    for (let songId in songObjectList) {
        songList.push(songObjectList[songId].id);
    }

    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", playlistAddTracksAPI, true);

    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 201) {
            document.getElementById("add-song-list").innerText = "";
            displayPlaylistSongs("playlist-songs", addPlaylist.songList);

            for (let songId in songObjectList) {
                mainPlaylist.addSong(songObjectList[songId])
            }
            
            addPlaylist = new Playlist("main", "web", 0, null, null, "add")
        }
    };

    // Create the json for the request body
    let bodyData = {};
    bodyData["track-list"] = songList;

    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(bodyData));
}