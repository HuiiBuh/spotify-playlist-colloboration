document.addEventListener("DOMContentLoaded", function () {
    addListener();
    updateCurrentPlayback();
    updateSearchBackground();
});


/**
 * Add the event listeners
 */
function addListener() {
    document.getElementById("devices-button").onclick = toggleDevices;
    document.getElementById("add-to-queue").onclick = toggleSearchDiv;
    document.getElementById("song-name").onkeyup = searchSongs;
    document.getElementById("song-name").onclick = searchSongs;
}


/**
 * Get the search background and return a update the background
 */
function updateSearchBackground() {
    let img = document.getElementsByClassName('cover-image')[0];
    let colorThief = new ColorThief();

    if (img.complete) {
        updateBackground(colorThief.getColor(img), img.src)
    } else {
        img.addEventListener("load", imgLoaded)
    }

    function imgLoaded(event) {
        updateBackground(colorThief.getColor(event.target), event.target.src);
    }
}


/**
 * Update the background color of the search field and the background image for the page
 * @param color {Array} Array with (r,g,b)
 * @param imageUrl {string} The image url
 */
function updateBackground(color, imageUrl) {
    let root = document.documentElement;
    let colorThreshold = 140;
    if (color[0] < colorThreshold || color[1] < colorThreshold || color[2] < colorThreshold) {
        root.style.setProperty("--search-background-color", "black");
        root.style.setProperty('--selection-color', "black");
        root.style.setProperty('--search-text-color', "white");
    } else {
        root.style.setProperty("--search-background-color", "white");
        root.style.setProperty('--selection-color', "white");
        root.style.setProperty('--search-text-color', "black");

    }

    let backgroundImage = document.getElementsByClassName("background-blur-image")[0];
    backgroundImage.style.backgroundImage = "url(" + imageUrl + ")";
}


