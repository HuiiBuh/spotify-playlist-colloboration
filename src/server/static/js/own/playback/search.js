/**
 * Toggle the
 * @param event
 */
function toggleSearchDiv(event) {
    let searchDiv = document.getElementsByClassName("search-div")[0];

    if (searchDiv.classList.contains("expand-search")) {
        searchDiv.classList.remove("expand-search");
        return
    }

    searchDiv.classList.add("expand-search");

    /**
     * Hide the search div
     * @param evt
     */
    function hideSearchDiv(evt) {
        let searchDiv = document.getElementsByClassName("search-div")[0];
        if (searchDiv.contains(evt.target)) {
            return
        }

        document.removeEventListener("click", hideSearchDiv);
        searchDiv.classList.remove("expand-search");
    }

    setTimeout(timeout => {
        document.addEventListener("click", hideSearchDiv);
    }, 10);
}

/**
 * Get the search background and return a update the background
 */
function getSearchBackground() {
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
        root.style.setProperty('--search-text-color', "white");
    } else {
        root.style.setProperty("--search-background-color", "white");
        root.style.setProperty('--search-text-color', "black")

    }

    let backgroundImage = document.getElementsByClassName("background-blur-image")[0];
    backgroundImage.style.backgroundImage = "url(" + imageUrl + ")";
}
