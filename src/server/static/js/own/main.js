/*Parameters*/
let searchAPIUrl = "/api/spotify/search?searchterm=";


let mainPlaylist = null;
let searchPreviewPlaylist = null;

smallStyleChanges();

M.AutoInit();


window.onload = function () {
    getPlaylistInfo("/api/spotify/playlist");
    getPlaylistSongs("/api/spotify/playlist/tracks");
    addEventHandler()
};


function smallStyleChanges() {
    document.getElementById("loading-playlist-description").style.height = document.getElementById("playlist-cover").offsetHeight + "px";
}


function addEventHandler() {
    document.getElementById("search-playlist-song").onkeyup = search_playlist;
    document.getElementById("new-song-search").onkeyup = songSearch;
}
