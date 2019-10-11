let addTimeouts = null;

function songSearch(evt) {
    if (addTimeouts) {
        clearTimeout(addTimeouts);
    }

    let searchValue = evt.currentTarget.value;
    searchValue = searchValue.replace(/[\\^$*+?.()|[\]{}]/g, '');

    if (/^\s*$/g.test(searchValue) || searchValue === "") {
        return
    }

    addTimeouts = setTimeout(function () {

        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                let songList = createSongs(JSON.parse(this.responseText));
                displaySearchPreview(songList);
            }
        };
        let url = searchAPIUrl + searchValue;

        xhttp.open("GET", url, true);
        xhttp.send();

    }, 200);
}

function displaySearchPreview(searchSongList) {
    let root = document.getElementById("search-preview");
    root.innerText = "";

    for (let songNumber in searchSongList) {
        let song = searchSongList[songNumber];

        var {cover, title, url, artist, album, id} = searchSongList[songNumber];

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
        addPlaylistIcon.setAttribute("class", "material-icons poiter");
        addPlaylistIcon.innerText = "playlist_add";
        addPlaylistDiv.appendChild(addPlaylistIcon);
    }
}