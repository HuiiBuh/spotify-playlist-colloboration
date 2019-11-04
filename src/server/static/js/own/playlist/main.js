/*Parameters*/

let mainPlaylist = new Playlist(null, null, null, null, null, "main");
let searchPreviewPlaylist = null;

smallStyleChanges();

window.onload = function () {
    getPlaylistInfo();
    getPlaylistSongs();
    addEventHandler()
};


function addEventHandler() {
    document.getElementById("search-playlist-song").onkeyup = searchPlaylist;

    document.getElementById("new-song-search").onclick = songSearch;
    document.getElementById("new-song-search").onkeyup = songSearch;

    document.getElementById("add-song-button").onclick = addSongsToPlaylist;

    document.getElementById("clear-search-input").onclick = function () {
        document.getElementById("search-playlist-song").value = "";
        document.getElementById("search-results-block").style.display = "none";
        document.getElementById("playlist-songs").style.display = "block";
    };

    document.getElementById("song-modal").addEventListener("click", function (evt) {
        if (!document.getElementById("click-exception").contains(evt.target))
            document.getElementById("search-preview").innerText = ""
    });
}


function smallStyleChanges() {
    document.getElementById("loading-playlist-description").style.height = document.getElementById("playlist-cover").offsetHeight + "px";
}