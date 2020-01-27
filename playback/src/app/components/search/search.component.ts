import {Component, HostBinding, OnInit} from '@angular/core';
import {SearchService} from './search.service';
import {EventManager} from '@angular/platform-browser';
import {Api} from '../api.service';
import {SongList} from '../song';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  @HostBinding('class.expand-search')
  isOpen: boolean;
  private removeEventListener: () => void;
  private searchTimeout: number;

  searchSongList: SongList = new SongList();


  constructor(
    private searchService: SearchService,
    private eventManager: EventManager,
    private api: Api
  ) {
  }

  ngOnInit(): void {
    this.searchService.change.subscribe(isOpen => {
      this.isOpen = isOpen;
      if (this.isOpen) {
        setTimeout(() => {
          // @ts-ignore
          this.removeEventListener = this.eventManager.addEventListener(document, 'click', this.handleHideEvent(this));
        }, 50);
      }
    });
  }

  handleHideEvent(self: this): (event: any) => void {
    return (event: any) => {
      if (!document.getElementsByClassName('search-div')[0].contains(event.target)) {
        self.isOpen = false;
        self.removeEventListener();
        self.removeEventListener = () => {
        };
      }
    };
  }

  search(event: KeyboardEvent): void {
    const element: HTMLInputElement = event.currentTarget as HTMLInputElement;
    const value: string = element.value;

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    if (value.trim().length === 0) {
      return;
    }

    this.searchTimeout = setTimeout((): void => {
      this.api.search(value).subscribe(searchJSON => {
        this.searchSongList.jsonToSongList(searchJSON);
        
        console.log(this.searchSongList.songList);
      });
    }, 200);


  }
}
