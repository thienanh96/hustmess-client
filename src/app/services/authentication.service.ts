import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Http, Headers, URLSearchParams } from '@angular/http';
import { Observable, Subject, ReplaySubject, from, of, range } from 'rxjs';
import { map, filter, switchMap, catchError } from 'rxjs/operators';
import { tokenNotExpired } from 'angular2-jwt';
import {DOMAIN} from '../../../src/domain';
 
@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  myID: string;
  authToken: string;
  code: string;
  private tokenStatus: BehaviorSubject<any> = new BehaviorSubject(null);
  constructor(private http: Http, private location: Location, private router: Router) {
    if (this.loggedIn()) {
      this.tokenStatus.next({
        isAdded: true
      })
    } else {
      this.tokenStatus.next({
        isAdded: false
      })
    }
  }
  registerUser(user) {
    let headers = new Headers();
    console.log('auth', user)
    headers.append('Content-Type', 'application/json');
    return this.http.post(DOMAIN + 'register', user, { headers: headers }).pipe(map(res => res.json()));
  }

  loginUser(user) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post(DOMAIN + 'login', user, { headers: headers }).pipe(map(res => res.json()));
  }

  validateExist(info: any) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post(DOMAIN + 'validate', info, { headers: headers }).pipe(map(res => res.json()));
  }



  storeToken(token: string) {
    localStorage.setItem('id_token', token);
    if (this.loggedIn()) {
      this.tokenStatus.next({
        isAdded: true
      })
    } else {
      this.tokenStatus.next({
        isAdded: false
      })
    }

  }

  getTokenStatus(){
    return this.tokenStatus.asObservable();
  }

  loadToken() {
    const token = localStorage.getItem('id_token');
    this.authToken = token;
  }

  loggedIn() {
    return tokenNotExpired(null, localStorage.getItem("id_token"))
  }

  logout() {
    localStorage.setItem('isLoggedIn', 'false');
    this.authToken = null;
    localStorage.clear();
  }
}
