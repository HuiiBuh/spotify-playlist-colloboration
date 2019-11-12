//The main playlist
let mainPlaylist = new Playlist(null, null, null, null, null, "main");

//Adjust the height of the placeholder
document.getElementById("loading-playlist-description").style.height = document.getElementById("playlist-cover").offsetHeight + "px";

/**
 * Load the different information and add event listeners
 */
window.onload = function () {
    getPlaylistInfo();
    getPlaylistSongs();
    addEventHandler();
    addScrollSearch();
    getScrollbarWidth();
};

/**
 * Add event listeners to the different functions
 */
function addEventHandler() {
    //Search the playlist if a key is pressed
    document.getElementById("search-playlist-song").onkeyup = searchPlaylist;
    document.getElementById("search-playlist-song").onclick = searchPlaylist;

    //Search for a song in the api if you click in the search bar or type
    document.getElementById("new-song-search").onclick = songSearch;
    document.getElementById("new-song-search").onkeyup = songSearch;

    //Add the selected songs to the current playlist onclick
    document.getElementById("add-song-button").onclick = addSongsToPlaylist;

    //Clear the search in the playlist
    document.getElementById("clear-search-input").onclick = function () {
        document.getElementById("search-playlist-song").value = "";
        document.getElementById("search-results-block").style.display = "none";
        document.getElementById("playlist-songs").style.display = "block";
    };

    //Add a event to the modal which hides the search preview onclick
    document.getElementById("song-modal").addEventListener("click", function (evt) {
        //Check if the click happened not on the search preview or the input filed
        if (!document.getElementById("click-exception").contains(evt.target)) {
            //Empty the search preview
            document.getElementById("search-preview").innerText = ""
        }
    });

    let modal = M.Modal.init(document.getElementById("song-modal"), {"onOpenEnd": removeTransform})

}

function removeTransform() {
    document.getElementById("song-modal").style.transform = "none";
}
