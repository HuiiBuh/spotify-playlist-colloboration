import {Component, OnInit} from '@angular/core';
import {SearchService} from "../search/search.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(
    private searchService: SearchService) {

  }

  ngOnInit() {
  }

  toggleSearch() {
    this.searchService.toggle();
  }
}
