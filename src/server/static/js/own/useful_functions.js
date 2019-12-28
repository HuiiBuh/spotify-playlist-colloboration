/**
 * Shows a error message by passing the response of a http request
 * @param self the http request
 */
function showErrorMessage(self) {
    let error_response = self.responseText;
    error_response = error_response.split("<p>")[1].replace("</p>", "");

    let toast_message = document.createElement("p");
    toast_message.style.marginTop = "0px";
    toast_message.style.marginBottom = "0px";
    toast_message.innerText = error_response;

    M.toast({html: toast_message, classes: "bg-warning"})
}

/**
 * Add return a onclick function with an independent url
 * @param onclick_url The url that is supposed to be added to the url
 * @returns {Function} The function that will be executed onclick
 */
function addOnclick(onclick_url) {
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
