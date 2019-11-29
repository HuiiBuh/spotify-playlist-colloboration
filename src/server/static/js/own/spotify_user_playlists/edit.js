/**
 * Update the duration of the playlist
 * @returns {Function} The function
 */
function updatePlaylistDuration() {
    let timeout = null;

    return function (evt) {
        onlyNumbers(evt);

        // Clear timeout if not enough time has passed
        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            // Get current duration
            let duration = parseInt(evt.target.value);
            // get the default duration
            let defaultDuration = evt.target.getAttribute("default-duration");

            // Check if the input is no number or nothing
            if (Number.isNaN(duration) || duration === "") {
                duration = 0
            }

            // Check if the duration is the default duration
            if (defaultDuration == duration) {
                return
            }

            // Check if the duration is larger that a 63 bit number
            duration = Math.abs(duration);
            if (duration > 9223372036854775807) {
                duration = 0
            }

            // Get id of playlist
            let id = evt.target.id.split("-")[0];

            // Build url
            let url = playlistDurationAPI + id + "&duration=" + duration;
            let xhttp = new XMLHttpRequest();

            xhttp.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    // Set default value
                    evt.target.value = duration;
                    evt.target.setAttribute("default-duration", duration);
                    M.toast({html: "Updated the playlist duration", classes: "bg-success"})
                } else if (this.readyState === 4) {
                    showErrorMessage(this);
                }
            };

            xhttp.open("GET", url, true);
            xhttp.send();

        }, 300);
    }
}
