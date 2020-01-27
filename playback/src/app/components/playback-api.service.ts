import {EventEmitter, Injectable, Output} from '@angular/core';
import * as io from 'socket.io-client';
import {URLS} from '../URLS';

@Injectable({
  providedIn: 'root'
})
export class PlaybackApiService {

  // Our socket connection
  private socket: SocketIOClient.Socket;
  private url: string = URLS.api.playbackWS;

  @Output() device: EventEmitter<any> = new EventEmitter<any>();
  @Output() playback: EventEmitter<any> = new EventEmitter<any>();


  connect(): void {
    const socket = io.connect(this.url);
    socket.on('connect', () => {
      socket.emit('start_sync', {spotify_user_id: 'nhaderer'});
    });

    socket.on('playback', (msg) => {
      console.log(msg);
      this.playback.emit(msg);
    });

    socket.on('devices', (msg) => {
      console.log(msg);
      this.device.emit(msg.devices);
    });
  }
}
