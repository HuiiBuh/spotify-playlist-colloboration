import {EventEmitter, Injectable, Output} from '@angular/core';
import * as io from 'socket.io-client';
import {spotifyUserID, URLS} from '../URLS';

@Injectable({
  providedIn: 'root'
})
export class QueueApiService {

  // Our socket connection
  private socket: SocketIOClient.Socket;
  private url: string = URLS.api.queueWS;

  @Output() queue: EventEmitter<object> = new EventEmitter<object>();

  connect(): void {
    this.socket = io.connect(this.url);
    this.socket.on('connect', () => {
      this.socket.emit('update_queue', {spotify_user_id: spotifyUserID});
    });

    this.socket.on('queue', (msg) => {
      this.queue.emit(msg);
    });

    this.socket.on('playback_error', (msg) => {
      console.log(msg);
    });
  }
}
