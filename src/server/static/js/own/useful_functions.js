function showErrorMessage(self) {
    let error_response = self.responseText;
    error_response = error_response.split("<p>")[1].replace("</p>", "");

    let toast_message = document.createElement("p");
    toast_message.style.marginTop = "0px";
    toast_message.style.marginBottom = "0px";
    toast_message.innerText = error_response;

    M.toast({html: toast_message, classes: "red"})
}

function addOnclick(onclick_url) {
    return function () {
        window.open(onclick_url)
    }
}