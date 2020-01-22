import {Component, Input, OnInit} from '@angular/core';
import {SearchComponent} from "../search/search.component";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Input()
  search: SearchComponent;

  constructor() {
  }

  ngOnInit() {
  }

  showSearch() {

  }
}
