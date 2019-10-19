let searchTimeout = null;

/**
 * Search the existing playlist
 * @param evt
 */
function searchPlaylist(evt) {
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    let searchValue = evt.currentTarget.value;
    searchValue = searchValue.replace(/[\\^$*+?.()|[\]{}]/g, '');

    // check for a valid input
    if (/^\s*$/g.test(searchValue) || searchValue === "") {
        document.getElementById("search-results-block").style.display = "none";
        document.getElementById("playlist-songs").style.display = "block";
        return;
    }

    searchTimeout = setTimeout(function () {
        // Generate search value and check if it is none
        let searchValueList = document.getElementById("search-playlist-song").value;
        // Split every word in a separate search
        searchValueList = searchValueList.split(" ");

        let searchList = [];
        let songList = mainPlaylist.songList;

        // Loop through all songs in the playlist
        for (let songNumber in songList) {
            var song = songList[songNumber];

            let hit = true;
            for (let searchValueNumber in searchValueList) {
                // if one word is found concatenate the hit.
                // Only if every word is found the result is true
                let searchValue = searchValueList[searchValueNumber];
                if (!/^\s*$/g.test(searchValue)) {
                    let searchRegex = new RegExp(cleanForRegex(searchValue), "gi");
                    hit = hit && searchRegex.test(song.searchString);
                }
            }

            // Add the id of the song and element to a list if the song matches the search
            if (hit) {
                searchList.push(song.id)
            }
        }
        // display the search results
        displaySearch(searchList)
    }, 200);
}


function displaySearch(songIDList) {
    let root = document.getElementById("search-results");
    // Hide the playlist and display the search results
    document.getElementById("search-results-block").style.display = "block";
    document.getElementById("playlist-songs").style.display = "none";

    root.innerText = "";

    // Check if no songs where found
    if (songIDList.length === 0) {
        root.innerHTML = '<p class="small-padding-bottom">No songs found</p>';
    }

    // Clone the elements and display them
    for (let idNumber in songIDList) {
        let id = songIDList[idNumber];
        let node = document.getElementById(id).cloneNode(true);
        root.appendChild(node);
    }
}