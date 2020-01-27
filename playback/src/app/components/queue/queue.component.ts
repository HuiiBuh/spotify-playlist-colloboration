import {Component, OnInit} from '@angular/core';
import {QueueApiService} from '../queue-api.service';
import {Song, SongList} from '../song';

@Component({
  selector: 'app-queue',
  templateUrl: './queue.component.html',
  styleUrls: ['./queue.component.scss']
})
export class QueueComponent implements OnInit {

  queueSongs: [Song];

  constructor(
    private queueAPI: QueueApiService) {
    this.queueAPI.connect();
  }

  ngOnInit(): void {
    this.queueAPI.queue.subscribe(json => {
      this.queueSongs = new SongList(json.played, 'played').songList;
      // @ts-ignore
      this.queueSongs = this.queueSongs.concat(new SongList([json.playing], 'playing').songList[0]);
      // @ts-ignore
      this.queueSongs = this.queueSongs.concat(new SongList(json.queue, '').songList);
    });
  }

}
