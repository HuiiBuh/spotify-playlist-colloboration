import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {URLS} from '../URLS';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Api {

  // tslint:disable-next-line:typedef
  httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
  };

  constructor(
    private http: HttpClient
  ) {
  }

  search(search: string): Observable<object> {
    return this.http.get<object>(URLS.api.search + search);
  }

  pause(): Observable<object> {
    return this.http.put<object>(URLS.api.pause, null);
  }

  play(): Observable<object> {
    return this.http.put<object>(URLS.api.play, null);
  }

  next(): Observable<object> {
    return this.http.post<object>(URLS.api.next, null);
  }

  addSongToQueue(songID: string): Observable<object> {
    return this.http.post<object>(URLS.api.addSongToQueue + songID, null);
  }

  changeActiveDevice(deviceID: string): Observable<object> {
    const body = JSON.stringify({device_id: deviceID});
    return this.http.put<object>(URLS.api.deviceChange, body, this.httpOptions);
  }
}
