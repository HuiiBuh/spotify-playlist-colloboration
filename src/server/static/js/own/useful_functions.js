/**
 * Shows a error message by passing the response of a http request
 * @param self the http request
 */
function showErrorMessage(self) {
    let toast_message = document.createElement("p");
    toast_message.style.marginTop = "0px";
    toast_message.style.marginBottom = "0px";
    toast_message.innerText = self.responseText;

    M.toast({html: toast_message, classes: "bg-warning"})
}

function showSuccessMessage(self) {
    let toast_message = document.createElement("p");
    toast_message.style.marginTop = "0px";
    toast_message.style.marginBottom = "0px";
    toast_message.innerText = self.responseText;

    M.toast({html: toast_message, classes: "bg-success"})
}

/**
 * Add return a onclick function with an independent url
 * @param {string} onclick_url The url that is supposed to be added to the url
 * @returns {Function} The function that will be executed onclick
 */
function urlOnclick(onclick_url) {
    return function () {
        window.open(onclick_url)
    }
}

/**
 * Pad a string with a number of leading characters (default 0)
 * @param value The item that is supposed to be padded
 * @param width The number of padings
 * @param characters What character should pad
 * @returns {string} The padded value
 */
function pad(value, width, characters) {
    characters = characters || '0';
    value += '';
    return value.length >= width ? value : new Array(width - value.length + 1).join(characters) + value;
}

/**
 * Clean a string for a regex search
 * @param regexString The regex string
 * @returns {string} The cleaned regex string
 */
function cleanForRegex(regexString) {
    if (typeof (regexString) === "string")
        return regexString.replace(/[\\^$*+?.()|[\]{}]/g, '');
}

/**
 * Allow only numbers in the input
 * @param evt The event of the input filed
 */
function onlyNumbers(evt) {
    let theEvent = evt || window.event;

    if (theEvent.key === "Backspace" || theEvent.key === "key") {
        return
    }

    // F1 to F12
    if (112 <= theEvent.keyCode && theEvent.keyCode <= 123) return;
    // Direction keys
    if (37 <= theEvent.keyCode && theEvent.keyCode <= 40) return;


    let number = parseInt(theEvent.key);
    if (Number.isNaN(number)) {
        theEvent.returnValue = false;
        if (theEvent.preventDefault) theEvent.preventDefault();
    }
}

/**
 * Converts an RGB color value to HSL. Conversion formula
 * Assumes r, g, and b are contained in the set [0, 255] and
 *
 * @param  r {number} The red color value
 * @param  g {number} The green color value
 * @param  b {number} The blue color value
 * @return  {Array}   The HSL representation
 */
function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        let difference = max - min;
        s = l > 0.5 ? difference / (2 - max - min) : difference / (max + min);

        switch (max) {
            case r:
                h = (g - b) / difference + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / difference + 2;
                break;
            case b:
                h = (r - g) / difference + 4;
                break;
        }

        h /= 6;
    }

    return [h, s, l];
}


/**
 * Create song objects from json
 * @param json The json with the song objects
 * @param type "main" for the main playlist
 * @param appendList The list the songs are supposed to be appended to
 * @returns {[]|Array}
 */
function jsonToSongList(json, type, appendList = []) {

    //Loop through the json and create the songs
    for (let songId in json) {
        if (!json.hasOwnProperty(songId)) continue;

        let songJSON = json[songId];


        let song = new Song(
            songId,
            songJSON["album"],
            songJSON["url"],
            songJSON["artists"],
            songJSON["duration"],
            songJSON["cover"],
            songJSON["title"],
            songJSON["album"]["artist"]
        );

        if (type === "main")
            mainPlaylist.addSong(song);
        else
            appendList.push(song);
    }

    if (type === "main")
        displayPlaylistSongs("playlist-songs", mainPlaylist.songList, "main");
    else
        return appendList
}


/**
 * Sleep for <> ms
 * @param ms The ms that you want to sleep
 * @returns {Promise<void>}
 */
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Convert the ms in a hh:mm:ss string
 * @param ms the ms
 */
function msToHumanReadable(ms) {
    //The human readable duration
    let hDuration = "";

    //Get the seconds and fill the missing 0s
    let seconds = parseInt((ms / 1000) % 60).toString();
    let minutes = (parseInt((ms / (1000 * 60) % 60))).toString();
    let hours = (parseInt((ms / (1000 * 60 * 60)) % 60)).toString();

    //Pad leading 0s if the hour is not 0
    if (hours !== "0") {
        hDuration += pad(hours, 2) + ":"
    }

    hDuration += pad(minutes, 2) + ":" + pad(seconds, 2);
    return hDuration
}
