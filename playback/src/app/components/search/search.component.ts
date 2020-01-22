import {Component, HostBinding, OnInit} from '@angular/core';
import {SearchService} from "./search.service";

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  @HostBinding('class.expand-search')
  isOpen = false;

  constructor(
    private searchService: SearchService) {
  }

  ngOnInit() {
    this.searchService.change.subscribe(isOpen => {
      this.isOpen = isOpen;
    })
  }
}
