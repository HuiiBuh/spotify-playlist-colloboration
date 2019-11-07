// Auto init all the material components
M.AutoInit();

//Update the copyright time
window.onload = function () {
    if (!window.location.pathname === "/login") {
        document.getElementById("copyright").innerText = "© " + new Date().getFullYear() + " HuiiBuh"
    }
};

//Create the hover emulation
let hoverOnTouch = new HoverOnTouch();
hoverOnTouch.start();
