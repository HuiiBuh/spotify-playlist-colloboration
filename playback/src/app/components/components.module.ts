import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {QueueComponent} from './queue/queue.component';
import {CoverComponent} from './cover/cover.component';
import {SearchComponent} from "./search/search.component";
import { ProgressComponent } from './progress/progress.component';


@NgModule({
  declarations: [QueueComponent, CoverComponent, SearchComponent, ProgressComponent],
  exports: [
    CoverComponent,
    QueueComponent,
    ProgressComponent
  ],
  imports: [
    CommonModule
  ]
})
export class ComponentsModule {
}

