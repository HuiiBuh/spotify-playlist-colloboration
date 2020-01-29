import {Component, OnInit} from '@angular/core';
import {EventManager} from '@angular/platform-browser';
import {PlaybackApiService} from '../playback-api.service';
import {Progress} from './progress.class';
import {URLS} from '../../URLS';
import {Api} from '../api.service';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss']
})
export class ProgressComponent implements OnInit {

  // tslint:disable-next-line:typedef
  marginLeft = '-140px';
  deviceClass: string;

  // @ts-ignore
  devices: [object] = [];
  playbackData: Progress = new Progress(1, 0, false);

  private removeEventListener: () => void;
  deviceImage: string = URLS.deviceImage;


  constructor(
    private eventManager: EventManager,
    private api: Api,
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
        if (this.playbackData.playing) {
          this.playbackData.duration = apiData.song.item.duration_ms;
          this.playbackData.current = apiData.song.progress_ms;
        } else {
          this.playbackData.duration = 1;
          this.playbackData.current = 0;
        }
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

  /**
   * Hide the Device menu if you click next to it
   * @param self The object instance
   */
  handleHideEvent(self: this): (event: MouseEvent) => void {
    return (event: MouseEvent): void => {
      // @ts-ignore
      if (!document.getElementsByClassName('device-text')[0].contains(event.target)) {
        self.toggleDeviceMenu();
      }
    };
  }


  /**
   * Change the playback to another device
   * @param deviceID The id of the device the playback gets assigned to
   */
  changeSpotifyFocus(deviceID: string): void {
    this.api.changeActiveDevice(deviceID).subscribe(() => {
    }, error => {
      console.log(error);
    });
  }

  /**
   * Return the active class for the right device
   * @param active Is the device active
   */
  addActiveClass(active: string): string {
    if (active) {
      return 'active-green';
    }
    return '';
  }

  /**
   * Scroll to the current song in the queue
   */
  scrollToCurrent(): void {
    document.getElementsByClassName('playing')[0].scrollIntoView();
  }

  /**
   * Toggle the current playback
   */
  togglePlaying(): void {
    if (this.playbackData.playing) {
      this.api.pause().subscribe(() => {
      }, error => {
        console.log(error);
      });
      return;
    }
    this.api.play();
  }

  /**
   * Play the next song
   */
  nextSong(): void {
    this.api.next().subscribe(() => {
    }, error => {
      console.log(error);
    });
  }
}


