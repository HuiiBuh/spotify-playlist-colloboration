/**
 * Move the search bar to the top if you scroll to far down
 */
function addScrollSearch() {
    document.getElementById("song-modal").onscroll = function () {
        fixSearch()
    };

    function fixSearch() {
        let offset = document.getElementById("sticky-indicator").getBoundingClientRect().top;
        if (offset <= 5) {
            document.getElementById("click-exception").classList.add("sticky")
        } else {
            document.getElementById("click-exception").classList.remove("sticky");
        }
    }
}

/**
 * Get the width of a scrollbar and store it in a css variable
 */
function getScrollbarWidth() {
    let scrollDiv = document.createElement("div");
    scrollDiv.className = "scrollbar-measure";
    document.body.appendChild(scrollDiv);

    // Get the scrollbar width
    let scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;

    // Delete the DIV
    document.body.removeChild(scrollDiv);

    document.documentElement.style.setProperty('--scrollbar-width', scrollbarWidth.toString() + "px");
}
