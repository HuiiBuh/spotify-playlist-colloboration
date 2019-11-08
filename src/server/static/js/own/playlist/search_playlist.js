let searchTimeout = null;

/**
 * Search the existing playlist
 * @param evt
 */
function searchPlaylist(evt) {
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    //Clean the search value
    let searchValue = evt.currentTarget.value;
    searchValue = cleanForRegex(searchValue);

    // Check if the search value is empty and hide the preview if this is the case
    if (/^\s*$/g.test(searchValue) || searchValue === "") {
        document.getElementById("search-results-block").style.display = "none";
        document.getElementById("playlist-songs").style.display = "block";
        return;
    }

    //Wait until a certain amount or time has passed between the key strokes
    searchTimeout = setTimeout(function () {

        //Split the by spaces separated values
        let searchValueList = searchValue.split(" ");

        //Get all songs from the main playlist
        let songList = mainPlaylist.songList;

        //All songs which are found
        let searchResultList = [];

        songList.forEach(function (song) {
            let hit = true;

            //Loop every search word and check if the word could be found
            searchValueList.forEach(function (searchValue) {
                //Check if the search value is not an empty string
                if (!/^\s*$/g.test(searchValue)) {
                    let searchRegex = new RegExp(cleanForRegex(searchValue), "gi");
                    hit = hit && searchRegex.test(song.searchString);
                }
            });

            // Add the id of the song and element to a list if the song matches the search
            if (hit) {
                searchResultList.push(song)
            }
        });

        // display the search results
        displaySearch(searchResultList)

    }, 200);
}

/**
 * Display the list of songs that could be found
 * @param songList The songs that have been found
 */
function displaySearch(songList) {
    let root = document.getElementById("search-results");

    // Hide the playlist and display the search results
    document.getElementById("search-results-block").style.display = "block";
    document.getElementById("playlist-songs").style.display = "none";

    root.innerText = "";

    // Check if no songs where found
    if (songList.length === 0) {
        root.innerHTML = '<p class="small-padding-bottom">No songs found</p>';
    }

    displayPlaylistSongs("search-results", songList, "search")
}