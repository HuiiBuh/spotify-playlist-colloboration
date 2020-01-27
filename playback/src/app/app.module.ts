import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MobileComponent } from './mobile/mobile.component';
import { DesktopComponent } from './desktop/desktop.component';
import {ComponentsModule} from './components/components.module';
import {HeaderComponent} from './components/header/header.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    MobileComponent,
    DesktopComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    ComponentsModule,
    HttpClientModule
  ],
  providers: [],
  exports: [

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
