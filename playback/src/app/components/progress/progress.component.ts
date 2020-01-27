import {Component, OnInit} from '@angular/core';
import {EventManager} from '@angular/platform-browser';
import {PlaybackApiService} from '../playback-api.service';
import {Progress} from './progress.class';
import {URLS} from '../../URLS';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss']
})
export class ProgressComponent implements OnInit {

  // tslint:disable-next-line:typedef
  marginLeft = '-140px';
  deviceClass: string;

  devices: [] = [];
  playbackData: Progress = new Progress(1, 0, false);

  private removeEventListener: () => void;
  deviceImage: string = URLS.deviceImage;


  constructor(
    private eventManager: EventManager,
    private playbackApi: PlaybackApiService
  ) {
  }

  ngOnInit(): void {
    this.playbackApi.device.subscribe(apiData => {
      this.devices = apiData;
    });

    this.playbackApi.playback.subscribe(apiData => {
      if (apiData.playing) {
        this.playbackData.playing = apiData.song.is_playing;
        this.playbackData.duration = apiData.song.item.duration_ms;
        this.playbackData.current = apiData.song.progress_ms;
        return;
      }

      this.playbackData.playing = false;
      this.playbackData.current = 0;
      this.playbackData.duration = 1;

    });
  }


  /**
   * Toggle the device menu
   */
  toggleDeviceMenu(): void {

    // Get the devices element and align it correctly
    const element = document.getElementsByClassName('device-text')[0];
    const width = parseInt(window.getComputedStyle(element).getPropertyValue('width').replace('px', ''), 10);
    this.marginLeft = (width / -2) + 'px';

    // Show or hide the element and add/remove the body event listener
    if (this.deviceClass === 'show') {
      this.removeEventListener();
      this.deviceClass = '';
    } else {
      this.deviceClass = 'show';

      setTimeout(() => {
        // @ts-ignore
        this.removeEventListener = this.eventManager.addEventListener(document, 'click', this.handleHideEvent(this));
      }, 50);
    }
  }

  handleHideEvent(self: this): (event: MouseEvent) => void {
    return (event: MouseEvent): void => {
      // @ts-ignore
      if (!document.getElementsByClassName('device-text')[0].contains(event.currentTarget)) {
        self.toggleDeviceMenu();
      }
    };
  }


  changeSpotifyFocus(deviceID: string): void {

  }

  addActiveClass(active: string): string {
    if (active === 'active') {
      return 'active-green';
    }
    return '';
  }
}


