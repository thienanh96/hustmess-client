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
export class UserService {

  constructor(private http: Http, private authService: AuthenticationService) { }

  getUsers(quality: string) { // get my friends
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.authService.loadToken();
    headers.append('Authorization', this.authService.authToken);
    return this.http.get(DOMAIN + 'user/many?quality=' + quality , { headers: headers }).pipe(map(res => res.json()));
  }

  getAllUsers(){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.authService.loadToken();
    headers.append('Authorization', this.authService.authToken);
    return this.http.get(DOMAIN + 'user/all',{ headers: headers }).pipe(map(res => res.json()));
  }

  searchUsers(searchTerm: string,typeUser: string){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.authService.loadToken();
    headers.append('Authorization', this.authService.authToken);
    return this.http.get(DOMAIN + 'user/search/friends?termsearch=' + searchTerm +'&typeuser=' + typeUser, { headers: headers }).pipe(map(res => res.json()));
  }

  getUser(quality: string,userID: string){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.authService.loadToken();
    headers.append('Authorization', this.authService.authToken);
    return this.http.get(DOMAIN + 'user/one?quality=' + quality +'&userid=' + userID, { headers: headers }).pipe(map(res => res.json()));
  }

  getMe(quality: string){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.authService.loadToken();
    headers.append('Authorization', this.authService.authToken);
    return this.http.get(DOMAIN + 'user/me?quality=' + quality, { headers: headers }).pipe(map(res => res.json()));
  }

  getUsersFromIDs(IDs: Array<string>){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.authService.loadToken();
    headers.append('Authorization', this.authService.authToken);
    let body = {
      userIDs: IDs
    }
    return this.http.post(DOMAIN + 'user/many',body, { headers: headers }).pipe(map(res => res.json()));
  }

  updatePeerIDUser(peerID){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.authService.loadToken();
    headers.append('Authorization', this.authService.authToken);
    let body = {
      "detail.peerID": peerID
    }
    return this.http.put(DOMAIN + 'user',body, { headers: headers }).pipe(map(res => res.json()));
  }

  updateUserProfile(profile){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.authService.loadToken();
    headers.append('Authorization', this.authService.authToken);
    return this.http.put(DOMAIN + 'user',profile, { headers: headers }).pipe(map(res => res.json()));
  }
}
