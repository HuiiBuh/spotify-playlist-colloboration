/**
 * Toggle the devices
 * @param event
 */
function toggleDevices(event) {
    let element = document.getElementsByClassName("device-text")[0];

    //Check if the devices are shown
    if (element.classList.contains("show")) {
        element.classList.remove("show");
        return
    }

    updateDevices();

    //Get the width of the element
    let width = parseInt(window.getComputedStyle(element).getPropertyValue('width').replace("px", ""));
    element.style.marginLeft = width / -2 + "px";
    element.classList.add("show");

    /**
     * Hide the element
     * @param evt The event
     */
    function hideDeviceText(evt) {

        if (document.getElementsByClassName("device-text")[0].contains(evt.target)) {
            return
        }
        document.removeEventListener("click", hideDeviceText);
        document.getElementsByClassName("device-text")[0].classList.remove("show");
    }

    setTimeout(timeout => {
        document.addEventListener("click", hideDeviceText);
    }, 10);
}

function updateDevices(first = false) {
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            updateDevicesView(JSON.parse(this.responseText), first)
        } else if (this.readyState === 4) {
            showErrorMessage(this);
        }
    };

    xhttp.open("GET", devicesAPI, true);
    xhttp.send();
}

let noDeviceFound = function () {
    let root = document.createElement("div");
    root.setAttribute("class", "device-padding small-margin-bottom");

    let p1 = document.createElement("p");
    p1.innerText = "Play and control the Spotify playback on all your devices.";
    p1.setAttribute("class", "no-margin");
    root.appendChild(p1);

    let p2 = document.createElement("p");
    p2.innerText = "Start Spotify on another device, start playing.";
    p2.setAttribute("class", "no-margin small-padding-bottom");
    root.appendChild(p2);

    let button = document.createElement("a");
    button.setAttribute("class", "btn btn-flat");
    button.innerText = "Lean more";

    button.setAttribute("target", "_blank");
    button.setAttribute("href", "https://www.spotify.com/en/connect/");
    root.appendChild(button);

    return root
}();

function updateDevicesView(deviceJSON, first) {
    let root = document.getElementById("devices");
    root.innerText = "";

    if (deviceJSON["devices"].length === 0) {
        root.appendChild(noDeviceFound);

        if (first) {
            document.getElementById("devices-button").click();
        }
        return
    }

    deviceJSON["devices"].forEach(device => {
        let id = device.id;
        let name = device.name;
        let active = device.is_active;
        let deviceType = device.type;

        let deviceDiv = document.createElement("div");
        deviceDiv.onclick = switchDevice(id);
        deviceDiv.setAttribute("class", "flex-v-center device-padding pointer listening-option");
        deviceDiv.id = id;
        if (active)
            deviceDiv.classList.add("active-green");

        root.appendChild(deviceDiv);

        let deviceIcon = document.createElement("i");
        deviceIcon.setAttribute("class", "material-icons small");
        deviceIcon.innerText = deviceType.toLowerCase();
        deviceDiv.appendChild(deviceIcon);

        let deviceInfoSpan = document.createElement("span");
        deviceInfoSpan.setAttribute("class", "left-align padding-left");
        deviceDiv.appendChild(deviceInfoSpan);

        let deviceTypeP = document.createElement("p");
        deviceTypeP.setAttribute("class", "no-margin");
        deviceTypeP.innerText = deviceType;
        deviceInfoSpan.appendChild(deviceTypeP);

        let deviceNameP = document.createElement("p");
        deviceNameP.setAttribute("class", "no-margin");
        deviceNameP.innerText = name;
        deviceInfoSpan.appendChild(deviceNameP);

    })
}

function switchDevice(id) {
    return function () {
        let xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                try {
                    document.getElementsByClassName("active-green")[0].classList.remove("active-green");
                } catch {
                }

                document.getElementById(id).classList.add("active-green")
            } else if (this.readyState === 4) {
                showErrorMessage(this);
            }
        };

        let body = JSON.stringify({"device_id": id});

        xhttp.open("PUT", playerAPI, true);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send(body);
    }
}
