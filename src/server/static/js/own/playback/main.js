document.addEventListener("DOMContentLoaded", function () {

    test();

    startPlaybackSync();
    updateDevices(true);
    addListener();
});


/**
 * Add the event listeners
 */
function addListener() {
    document.getElementById("devices-button").onclick = toggleDevices;
    document.getElementById("add-to-queue").onclick = toggleSearchDiv;
    document.getElementById("song-name").onkeyup = searchSongs;
    document.getElementById("song-name").onclick = searchSongs;

    document.getElementById("pause").onclick = pause;
    document.getElementById("play").onclick = play;

    document.getElementById("next").onclick = next;
    document.getElementById("previous").onclick = previous;
}


/**
 * Get the search background and return a update the background
 */
function updateBackground() {
    // Get the cover image
    let img = document.getElementsByClassName('cover-image')[0];
    let colorThief = new ColorThief();

    // Get the image and the primary colors and update all things related
    if (img.complete) {
        updateVariables(colorThief.getColor(img), img.src)
    } else {
        img.addEventListener("load", imgLoaded)
    }

    function imgLoaded(event) {
        img.removeEventListener("load", imgLoaded);
        updateVariables(colorThief.getColor(event.target), event.target.src);
    }

    /**
     * Update the background color of the search field and the background image for the page
     * @param color {Array} Array with (r,g,b)
     * @param imageUrl {string} The image url
     */
    function updateVariables(color, imageUrl) {
        // Remove the event listener
        document.getElementsByClassName('cover-image')[0].removeEventListener("load", updateVariables);

        let root = document.documentElement;
        let colorThreshold = 140;

        // Set the color scheme for the search div
        root.style.setProperty("--search-background-color", "rgb(" + color + ")");
        if (color[0] < colorThreshold || color[1] < colorThreshold || color[2] < colorThreshold) {
            root.style.setProperty('--selection-color', "black");
            root.style.setProperty('--search-text-color', "white");
            root.style.setProperty('--placeholder-color', "#a8a8a8");
        } else {
            root.style.setProperty('--selection-color', "white");
            root.style.setProperty('--search-text-color', "black");
            root.style.setProperty('--placeholder-color', "#2f2f2f");
        }

        // Set the background image for the page
        let backgroundImage = document.getElementsByClassName("background-blur-image")[0];
        backgroundImage.style.backgroundImage = "url(" + imageUrl + ")";
    }
}


function test() {


    let url = location.protocol + '//' + document.domain + ':' + location.port + '/api/playback';

    let socket = io.connect(url);

    console.log(new Date());

    socket.on('connected', function (msg) {
        console.log(new Date());

        socket.emit('message_loop', {"start": "now"});
    });

    socket.on("message", function (msg) {
        console.log(msg);
        console.log(new Date());
    })

}
