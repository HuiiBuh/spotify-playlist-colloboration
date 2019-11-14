// Auto init all the material components
M.AutoInit();

if (!window.location.pathname === "/login") {
    document.getElementById("copyright").innerText = "© " + new Date().getFullYear() + " HuiiBuh"
}


if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/static/pwa/service_worker.js', {scope: "/"})
        .then(function () {
            console.log("Service Worker registered successfully");
        })
        .catch(function (e) {
            console.log("Service worker registration failed" + e)
        });
}


//Create the hover emulation
let hoverOnTouch = new HoverOnTouch();
hoverOnTouch.start();


/**
 * Check if the focus ring css should be added
 * @param e
 */
function handleFirstTab(e) {
    if (e.code === "Tab") { // the "I am a keyboard user" key

        let root = document.getElementsByTagName("head")[0];

        let style = document.createElement("style");
        style.type = "text/css";
        style.id = "tabbing";
        style.textContent = "" +
            "/*Show the current focused element*/\n" +
            "button:focus, a:focus, i:focus, .tabable:focus {\n" +
            "    box-shadow: 0 0 0 2pt rgb(209, 211, 255) !important;\n" +
            "}";
        root.appendChild(style);

        window.removeEventListener('keydown', handleFirstTab);
        window.addEventListener('mousedown', handleMouseDownOnce);
    }
}

/**
 * Remove the focus ring css if the mouse is used once again
 */
function handleMouseDownOnce() {
    document.getElementById("tabbing").remove();

    window.removeEventListener('mousedown', handleMouseDownOnce);
    window.addEventListener('keydown', handleFirstTab);
}

window.addEventListener('keydown', handleFirstTab);
