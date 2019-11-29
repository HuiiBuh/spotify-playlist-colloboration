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
                displayPlaylistSongs("search-preview", songList, "spotify-search")
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
 * Create the songs and check if the song is already in the playlist
 * @param song The song that is supposed to be added to the add playlist
 * @returns {Function} The function that will be called if the add song to playlist button is pressed
 */
function addToAddPlaylist(song) {

    return function (evt) {

        if (maxSongDuration !== 0 && song.duration >= maxSongDuration) {
            M.toast({
                html: "<span>The duration of the song is to long.</span> <div class='flex-break'></div>" +
                    "<span> Only songs shorter than <b>" + maxSongDuration + "</b> seconds can be added</span>"
                , classes: "bg-warning"
            });
            return
        }

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
            displayPlaylistSongs("add-song-list", [song], "add");
        } else {
            M.toast({html: "The Song already exists in the playlist", classes: "bg-warning"});
        }
    }
}

/**
 * Delete a song from the add song playlist
 * @param song The song that is supposed to be deleted
 * @returns {Function}
 */
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
            showErrorMessage(this);
        }
    };

    // Create the json for the request body
    let bodyData = {};
    bodyData["track-list"] = songList;

    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(bodyData));
}
