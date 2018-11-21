import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Headers, URLSearchParams } from '@angular/http';
import { Observable, Subject, ReplaySubject, from, of, range } from 'rxjs';
import { map, filter, switchMap, catchError } from 'rxjs/operators';
import { tokenNotExpired } from 'angular2-jwt';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class FriendService {

  constructor(private http: Http, private authService: AuthenticationService) { }

  getFriends(approved: string) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.authService.loadToken();
    headers.append('Authorization', this.authService.authToken);
    return this.http.get('http://localhost:3333/friend/many?approved=' + approved, { headers: headers }).pipe(map(res => res.json()));
  }
}
