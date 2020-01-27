import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {URLS} from '../URLS';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Api {

  constructor(
    private http: HttpClient
  ) {
  }

  search(search: string): Observable<object> {
    return this.http.get<object>(URLS.search + search);
  }

  hallo(): void {
    return null;
  }
}
