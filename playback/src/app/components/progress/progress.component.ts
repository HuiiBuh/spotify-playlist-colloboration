import {Component, OnInit} from '@angular/core';
import {EventManager} from "@angular/platform-browser";
import {PlaybackApiService} from "../playback-api.service";

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss']
})
export class ProgressComponent implements OnInit {

  private marginLeft = "-140px";

  private removeEventListener: Function;
  private deviceClass: string;


  constructor(
    private eventManager: EventManager,
    private playbackApi: PlaybackApiService
  ) {
  }

  ngOnInit() {
    this.playbackApi.device.subscribe(apiData => {
      this.updateDevices(apiData)
    });

    this.playbackApi.playback.subscribe(apiData => {
      this.updatePlayback(apiData)
    })
  }

  updatePlayback(apiData) {
    console.log(apiData)
  }

  updateDevices(apiData) {
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


}
