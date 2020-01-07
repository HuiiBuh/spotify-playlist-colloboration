let addTimeouts = null;

function searchSongs(evt) {

    // Clear timeout
    if (addTimeouts) {
        clearTimeout(addTimeouts);
    }

    // Get the search value and clean it
    let searchValue = evt.currentTarget.value;
    searchValue = cleanForRegex(searchValue);

    // Check if the search value is valid
    if (/^\s*$/g.test(searchValue) || searchValue === "") {
        document.getElementsByClassName("search-preview")[0].innerText = "";
        return
    }


    // Get the search results with a api call
    addTimeouts = setTimeout(function () {

        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                let songList = jsonToSongList(JSON.parse(this.responseText), "search");
                displaySearchSongs(songList)
            } else if (this.readyState === 4 && this.status !== 200) {
                showErrorMessage(this)
            }
        };

        let url = searchAPI + searchValue;
        xhttp.open("GET", url, true);
        xhttp.send();
    }, 200);
}

/**
 *
 * @param songList {[Song]}
 */
function displaySearchSongs(songList) {
    let root = document.getElementsByClassName("search-preview")[0];
    root.innerText = "";

    if (songList.length === 0) {
        let notFound = document.createElement("div");
        notFound.className = "flex-center";
        notFound.innerText = "Nothing was found";
        root.appendChild(notFound);
    }

    songList.forEach(function (song) {

        let songDiv = document.createElement("div");
        songDiv.setAttribute("class", "flex-v-center");
        root.appendChild(songDiv);

        let imageDiv = document.createElement("div");
        imageDiv.setAttribute("class", "col s2 xl1 center flex-v-center no-padding");
        songDiv.appendChild(imageDiv);

        let coverImage = document.createElement("img");
        coverImage.setAttribute("src", song.cover);
        coverImage.setAttribute("alt", "cover");
        imageDiv.appendChild(coverImage);

        let songInfoDiv = document.createElement("div");
        songInfoDiv.setAttribute("class", "col s8 xl10 to-long");
        songDiv.appendChild(songInfoDiv);

        let titleDiv = document.createElement("div");
        titleDiv.setAttribute("class", "s12 to-long");
        songInfoDiv.appendChild(titleDiv);

        let titleA = document.createElement("a");
        titleA.setAttribute("class", "pointer underline no-wrap");
        titleA.setAttribute("href", song.url);
        titleA.setAttribute("hover-on-touch", "");
        titleA.setAttribute("target", "_blank");
        titleA.innerText = song.title;
        titleDiv.appendChild(titleA);

        let artistDiv = document.createElement("div");
        artistDiv.setAttribute("class", "s12 to-long flex");
        songInfoDiv.appendChild(artistDiv);

        let artistA = document.createElement("a");
        artistA.setAttribute("class", "pointer underline no-wrap to-long no-shrink");
        artistA.setAttribute("href", song.albumArtist["url"]);
        artistA.setAttribute("hover-on-touch", "");
        artistA.setAttribute("target", "_blank");
        artistA.innerText = song.albumArtist["name"];
        artistDiv.appendChild(artistA);

        let addPlaylistDiv = document.createElement("div");
        addPlaylistDiv.setAttribute("class", "col s2 xl1 flex-v-center flex-center no-padding");
        songDiv.appendChild(addPlaylistDiv);

        let addPlaylistIcon = document.createElement("i");
        addPlaylistIcon.setAttribute("class", "material-icons pointer");
        addPlaylistIcon.onclick = addSongToQueue(song.id);
        addPlaylistIcon.innerText = "playlist_add";
        addPlaylistDiv.appendChild(addPlaylistIcon);

        let dividerDiv = document.createElement("div");
        dividerDiv.setAttribute("class", "divider small-margin-bottom small-margin-top");
        root.appendChild(dividerDiv);
    });
}

/**
 * Adds a song to the search queue
 * @param {string} songID The spotify song id
 */
function addSongToQueue(songID) {
    return function () {
        console.log(songID);
    }
}


/**
 * Toggle the
 * @param event
 */
function toggleSearchDiv(event) {
    let searchDiv = document.getElementsByClassName("search-div")[0];

    if (searchDiv.classList.contains("expand-search")) {
        searchDiv.classList.remove("expand-search");
        return
    }

    searchDiv.classList.add("expand-search");

    /**
     * Hide the search div
     * @param evt
     */
    function hideSearchDiv(evt) {
        let searchDiv = document.getElementsByClassName("search-div")[0];
        if (searchDiv.contains(evt.target)) {
            return
        }

        document.removeEventListener("click", hideSearchDiv);
        searchDiv.classList.remove("expand-search");
    }

    setTimeout(timeout => {
        document.addEventListener("click", hideSearchDiv);
    }, 10);
}

