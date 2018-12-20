import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Headers, URLSearchParams } from '@angular/http';
import { Observable, Subject, ReplaySubject, from, of, range } from 'rxjs';
import { map, filter, switchMap, catchError } from 'rxjs/operators';
import { tokenNotExpired } from 'angular2-jwt';
import { AuthenticationService } from './authentication.service';
import {DOMAIN} from '../../../src/domain';


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
    return this.http.get(DOMAIN + 'friend/many?approved=' + approved, { headers: headers }).pipe(map(res => res.json()));
  }

  addFriend(id){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.authService.loadToken();
    var user = { "secondUser" : id};
    headers.append('Authorization', this.authService.authToken);
    return this.http.post(DOMAIN + 'friend/', user , { headers: headers }).pipe(map(res => res.json()));
  }

  acceptFriend(id){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.authService.loadToken();
    console.log(id);
    headers.append('Authorization', this.authService.authToken);
    return this.http.put(DOMAIN + "friend?id="+ id, {"approved" : true}  , { headers: headers }).pipe(map(res => res.json()));
  }

  deleteFriend(id){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.authService.loadToken();
    headers.append('Authorization', this.authService.authToken);
    return this.http.delete(DOMAIN + 'friend?firstuser='+id, { headers: headers }).pipe(map(res => res.json()));
  }
}
