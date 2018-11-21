import { Injectable } from '@angular/core';

import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Http, Headers, URLSearchParams } from '@angular/http';
import { Observable, Subject, ReplaySubject, from, of, range } from 'rxjs';
import { map, filter, switchMap, catchError } from 'rxjs/operators';
import { tokenNotExpired } from 'angular2-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  myID: string;
  authToken: string;
  code: string;
  constructor(private http: Http, private location: Location, private router: Router) {

  }
  registerUser(user) {
    let headers = new Headers();
    console.log('auth', user)
    headers.append('Content-Type', 'application/json');
    return this.http.post('http://localhost:3333/register', user, { headers: headers }).pipe(map(res => res.json()));
  }

  loginUser(user) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('http://localhost:3333/login', user, { headers: headers }).pipe(map(res => res.json()));
  }

  validateExist(info: any) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('http://localhost:3333/validate', info, { headers: headers }).pipe(map(res => res.json()));
  }



  storeToken(token: string) {
    localStorage.setItem('id_token', token);
  }
  loadToken() {
    const token = localStorage.getItem('id_token');
    this.authToken = token;
  }

  loggedIn() {
    return tokenNotExpired();
  }

  logout() {
    localStorage.setItem('isLoggedIn', 'false');
    this.authToken = null;
    localStorage.clear();
  }
}
