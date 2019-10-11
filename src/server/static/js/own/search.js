let timeout = null;

function search() {
    if (timeout) {
        clearTimeout(timeout);
    }

    let searchValue = document.getElementById("search-playlist-song").value;
    if (/^\s*$/g.test(searchValue) || searchValue === "") {
        document.getElementById("search-results-block").style.display = "none";
        document.getElementById("playlist-songs").style.display = "block";
        return;
    }

    timeout = setTimeout(function () {
        // Generate search value and check if it is none
        let searchValueList = document.getElementById("search-playlist-song").value;
        searchValueList = searchValueList.split(" ");

        let returnList = [];
        let songList = mainPlaylist.songList;

        // Loop through all songs in the playlist
        for (let songNumber in songList) {
            if (songList.hasOwnProperty(songNumber)) {
                var song = songList[songNumber];
            }
            let hit = true;

            for (let searchValueNumber in searchValueList) {

                let searchValue = searchValueList[searchValueNumber];
                if (!/^\s*$/g.test(searchValue)) {
                    let searchRegex = new RegExp(searchValue, "gi");
                    hit = hit && searchRegex.test(song.searchString);
                }
            }

            if (hit) {
                returnList.push(song.id)
            }
        }
        displaySearch(returnList)
    }, 200);
}


function displaySearch(songIDList) {
    let root = document.getElementById("search-results");
    document.getElementById("search-results-block").style.display = "block";

    document.getElementById("playlist-songs").style.display = "none";
    root.innerText = "";

    for (let idNumber in songIDList) {
        let id = songIDList[idNumber];
        let node = document.getElementById(id).cloneNode(true);
        root.appendChild(node);
    }
}