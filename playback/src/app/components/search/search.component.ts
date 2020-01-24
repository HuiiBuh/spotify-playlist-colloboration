import {Component, HostBinding, OnInit} from '@angular/core';
import {SearchService} from "./search.service";
import {EventManager} from "@angular/platform-browser";

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  @HostBinding('class.expand-search')
  isOpen = false;
  private removeEventListener: Function;


  constructor(
    private searchService: SearchService,
    private eventManager: EventManager
  ) {
  }

  ngOnInit() {
    this.searchService.change.subscribe(isOpen => {
      this.isOpen = isOpen;
      if (this.isOpen) {
        setTimeout(() => {
          // @ts-ignore
          this.removeEventListener = this.eventManager.addEventListener(document, "click", this.handleHideEvent(this))
        }, 50);
      }
    })
  }

  handleHideEvent(self) {
    return function (event) {
      if (!document.getElementsByClassName("search-div")[0].contains(event.target)) {
        self.isOpen = false;
        self.removeEventListener();
        self.removeEventListener = () => {
        }
      }
    }
  }
}
