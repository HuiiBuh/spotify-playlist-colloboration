document.addEventListener("DOMContentLoaded", function () {
    addListener();
    getSearchBackground();
});


/**
 * Add the event listeners
 */
function addListener() {
    document.getElementById("devices-button").onclick = toggleDevices;
    document.getElementById("add-to-queue").onclick = toggleSearchDiv;
}

