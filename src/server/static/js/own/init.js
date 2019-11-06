M.AutoInit();

window.onload = function () {
    document.getElementById("copyright").innerText = "© " + new Date().getFullYear() + " HuiiBuh"
};


let hoverOnTouch = new HoverOnTouch();
hoverOnTouch.addEvents();
