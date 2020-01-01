function toggleSearchDiv(event) {
    let searchDiv = document.getElementsByClassName("search-div")[0];

    if (searchDiv.classList.contains("expand-search")) {
        searchDiv.classList.remove("expand-search");
        return
    }

    searchDiv.classList.add("expand-search");

    function hideSearchDiv(evt) {
        let searchDiv = document.getElementsByClassName("search-div")[0];
        if (searchDiv.contains(evt.target)) {
            return
        }

        searchDiv.classList.remove("expand-search");

    }

    event.stopPropagation();
    document.onclick = hideSearchDiv;
}

function getSearchBackground() {
    let colorThief = new ColorThief();
    let img = document.getElementsByClassName('cover-image')[0];

    function updateBackground(color) {
        let searchDiv = document.getElementsByClassName("search-div")[0];
        searchDiv.style.background = "rgb(" + color + ")";
        searchDiv.style.color = "black";


        let colorThreshold = 140;
        if (color[0] < colorThreshold || color[1] < colorThreshold || color[2] < colorThreshold) {
            searchDiv.style.color = "white";
        }
    }

    // Make sure image is finished loading
    if (img.complete) {
        updateBackground(colorThief.getColor(img));
    } else {
        img.addEventListener('load', function () {
            updateBackground(colorThief.getColor(img));
        });
    }


}


