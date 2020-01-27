import {Component, Input, OnInit} from '@angular/core';
import {URLS} from '../../URLS';
import {PlaybackApiService} from '../playback-api.service';

@Component({
  selector: 'app-cover',
  templateUrl: './cover.component.html',
  styleUrls: ['./cover.component.scss']
})
export class CoverComponent implements OnInit {

  @Input()
  desktop: boolean;
  playlistCover: string = URLS.placeholderImage;
  artist: string;
  trackURL: string;
  artistURL: string;
  track: string;

  loading: boolean;


  constructor(
    private playbackApi: PlaybackApiService
  ) {
  }

  ngOnInit(): void {
    this.playbackApi.playback.subscribe(playback => {
      if (!playback.playing) {
        this.playlistCover = URLS.placeholderImage;
        this.artist = 'Playing';
        this.artistURL = '#';
        this.trackURL = '#';
        this.track = 'No song';
        this.loading = true;
        return;
      }

      this.playlistCover = URLS.proxy + playback.song.item.album.images[0].url;
      this.artist = playback.song.item.album.artists[0].name;
      this.artistURL = playback.song.item.album.artists[0].external_urls.spotify;

      this.track = playback.song.item.name;
      this.trackURL = playback.song.item.external_urls.spotify;

      // @ts-ignore
      if (!document.getElementsByClassName('cover-image')[0].complete) {
        this.loading = true;
      }
    });
  }

  calculatePrimaryBackground(event: Event): void {
    this.loading = false;
  }
}
