M.AutoInit();

window.onload = function () {
    if (!window.location.pathname === "/login") {
        document.getElementById("copyright").innerText = "© " + new Date().getFullYear() + " HuiiBuh"
    }
};

let hoverOnTouch = new HoverOnTouch();
hoverOnTouch.start();
