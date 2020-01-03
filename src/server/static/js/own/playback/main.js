document.addEventListener("DOMContentLoaded", function () {
    startPlaybackSync();
    addListener();
    updateBackground();
    updateDevices();
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
function updateBackground() {
    let img = document.getElementsByClassName('cover-image')[0];
    let colorThief = new ColorThief();

    if (img.complete) {
        updateVariables(colorThief.getColor(img), img.src)
    } else {
        img.addEventListener("load", imgLoaded)
    }

    function imgLoaded(event) {
        updateVariables(colorThief.getColor(event.target), event.target.src);
    }

    /**
     * Update the background color of the search field and the background image for the page
     * @param color {Array} Array with (r,g,b)
     * @param imageUrl {string} The image url
     */
    function updateVariables(color, imageUrl) {
        let root = document.documentElement;
        root.style.setProperty("--search-background-color", "rgb(" + color + ")");
        let colorThreshold = 140;
        if (color[0] < colorThreshold || color[1] < colorThreshold || color[2] < colorThreshold) {
            root.style.setProperty('--selection-color', "black");
            root.style.setProperty('--search-text-color', "white");
            root.style.setProperty('--placeholder-color', "#a8a8a8");
        } else {
            root.style.setProperty('--selection-color', "white");
            root.style.setProperty('--search-text-color', "black");
            root.style.setProperty('--placeholder-color', "#2f2f2f");

        }

        let backgroundImage = document.getElementsByClassName("background-blur-image")[0];
        backgroundImage.style.backgroundImage = "url(" + imageUrl + ")";
    }

}




