import {EventEmitter, Injectable, Output} from '@angular/core';
import * as io from 'socket.io-client';
import {URLS} from "../URLS";

@Injectable({
  providedIn: 'root'
})
export class PlaybackApiService {

  // Our socket connection
  private socket;
  private url = URLS.api.playbackWS;

  @Output() device: EventEmitter<any> = new EventEmitter<any>();
  @Output() playback: EventEmitter<any> = new EventEmitter<any>();


  connect() {
    this.socket = io.connect(this.url);

    this.socket.on("connect", () => {
      this.socket.emit('start_sync', {"spotify_user_id": "nhaderer"});
    });

    this.socket.on("playback", (msg) => {
      this.playback.emit(msg);
    });

    this.socket.on("devices", (msg) => {
      this.device.emit(msg.devices);
    });
  }
}
