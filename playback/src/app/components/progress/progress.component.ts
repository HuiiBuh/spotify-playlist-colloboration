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
  playbackData = new Progress(1, 0, false);

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
      if (apiData.playing) {
        this.playbackData.playing = apiData.song.is_playing;
        this.playbackData.duration = apiData.song.item.duration_ms;
        this.playbackData.current = apiData.song.progress_ms;
        return
      }

      this.playbackData.playing = false;
      this.playbackData.current = 0;
      this.playbackData.duration = 1;

    })
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


  changeSpotifyFocus(deviceID: string) {

  }
}


/**
 * Pad a string with a number of leading characters (default 0)
 * @param value The item that is supposed to be padded
 * @param width The number of padings
 * @param characters What character should pad
 * @returns {string} The padded value
 */
function pad(value, width, characters = "0") {
  value += '';
  return value.length >= width ? value : new Array(width - value.length + 1).join(characters) + value;
}

class Progress {

  private _duration: number;
  private _current: number;
  private _playing: boolean;


  constructor(duration: number, current: number, playing: boolean) {
    this._duration = duration;
    this._current = current;
    this._playing = playing
  }

  _msToHuman(ms: number): string {
    let hDuration = "";

    //Get the seconds and fill the missing 0s
    let seconds: string = (Math.round((ms / 1000) % 60)).toString();
    let minutes: string = (Math.round((ms / (1000 * 60) % 60))).toString();
    let hours: string = (Math.round((ms / (1000 * 60 * 60)) % 60)).toString();

    //Pad leading 0s if the hour is not 0
    if (hours !== "0") {
      hDuration += pad(hours, 2) + ":";
    }

    hDuration += pad(minutes, 2) + ":" + pad(seconds, 2);
    return hDuration;
  }

  set playing(value: boolean) {
    this._playing = value;
  }

  set duration(value: number) {
    this._duration = value;
  }

  set current(value: number) {
    this._current = value;
  }

  get playing(): boolean {
    return this._playing;
  }

  get duration(): number {
    return this._duration;
  }

  get durationH(): string {
    return this._msToHuman(this._duration)
  }

  get currentPercent(): number {
    return Math.round((this._current / this._duration) * 100);

  }

  get current(): number {
    return this._current;
  }

  get currentH(): string {
    return this._msToHuman(this._current)
  }

  get playingIcon(): string {
    return this._playing ? "pause" : "play_arrow"
  }
}
