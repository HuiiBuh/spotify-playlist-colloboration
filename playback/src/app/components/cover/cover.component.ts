import {Component, Input, OnInit} from '@angular/core';
import {URLS} from "../../URLS";

@Component({
  selector: 'app-cover',
  templateUrl: './cover.component.html',
  styleUrls: ['./cover.component.scss']
})
export class CoverComponent implements OnInit {

  @Input()
  desktop: boolean = false;
  playlistCover: string = URLS.placeholderImage;

  constructor() {
  }

  ngOnInit() {
  }

}
