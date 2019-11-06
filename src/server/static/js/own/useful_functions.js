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