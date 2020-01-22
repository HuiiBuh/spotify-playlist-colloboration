import {Component, OnInit} from '@angular/core';
import {EventManager} from "@angular/platform-browser";
import {PlaybackApiService} from "../playback-api.service";

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss']
})
export class ProgressComponent implements OnInit {

  marginLeft = "-140px";
  deviceClass: string;
  devices: [] = [];

  private removeEventListener: Function;


  constructor(
    private eventManager: EventManager,
    private playbackApi: PlaybackApiService
  ) {
    this.playbackApi.connect()
  }

  ngOnInit() {
    this.playbackApi.device.subscribe(apiData => {
      this.devices = apiData;
    });

    this.playbackApi.playback.subscribe(apiData => {
      this.updatePlayback(apiData)
    })
  }

  updatePlayback(apiData) {
    console.log(apiData)
  }


  /**
   * Toggle the device menu
   */
  toggleDeviceMenu() {

    //Get the devices element and align it correctly
    const element = document.getElementsByClassName("device-text")[0];
    const width = parseInt(window.getComputedStyle(element).getPropertyValue('width').replace("px", ""));
    this.marginLeft = (width / -2) + "px";

    //Show or hide the element and add/remove the body event listener
    if (this.deviceClass === "show") {
      this.removeEventListener();
      this.deviceClass = "";
    } else {
      this.deviceClass = "show";

      setTimeout(() => {
        // @ts-ignore
        this.removeEventListener = this.eventManager.addEventListener(document, "click", this.handleHideEvent(this))
      }, 50);
    }
  }

  handleHideEvent(self) {
    return function () {
      self.toggleDeviceMenu();
    }
  }


  changeFocus(deviceID: string) {

  }
}
