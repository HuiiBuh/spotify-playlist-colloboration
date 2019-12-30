window.onload = function () {
    addListener()

};

function toggleDevices(event) {
    let element = document.getElementsByClassName("device-text")[0];

    //Check if the devices are shown
    if (element.classList.contains("show")) {
        element.classList.remove("show");
        return
    }

    //Get the width of the element
    let width = parseInt(window.getComputedStyle(element).getPropertyValue('width').replace("px", ""));
    element.style.marginLeft = width / -2 + "px";
    element.classList.add("show");

    /**
     * Hide the element
     * @param evt The event
     */
    function hideDeviceText(evt) {
        if (document.getElementsByClassName("device-text")[0].contains(evt.target)) {
            return
        }
        document.getElementsByClassName("device-text")[0].classList.remove("show");
    }

    event.stopPropagation();
    //Add the handler to hide the element
    document.onclick = hideDeviceText;
}

/**
 * Add the event listeners
 */
function addListener() {
    document.getElementsByClassName("devices")[0].onclick = toggleDevices;
    document.getElementById("add-to-queue").onclick = toggleSearchDiv;
    document.getElementById("close-search-div").onclick = toggleSearchDiv;
}


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
