import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-cover',
  templateUrl: './cover.component.html',
  styleUrls: ['./cover.component.scss']
})
export class CoverComponent implements OnInit {

  @Input()
  desktop: boolean = false;

  constructor() {
  }

  ngOnInit() {
  }

}
