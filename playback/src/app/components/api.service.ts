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
    return this.http.get<object>(URLS.search + search);
  }

  addSongToQueue(songID: string): Observable<string> {
    return this.http.post<string>(URLS.addSongToQueue + songID, null);
  }

  changeActiveDevice(deviceID: string): Observable<string> {
    const body = JSON.stringify({device_id: deviceID});
    return this.http.put<string>(URLS.deviceChange, body, this.httpOptions);
  }
}
