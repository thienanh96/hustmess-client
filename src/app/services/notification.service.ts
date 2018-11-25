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
export class NotificationService {

  constructor(private http: Http, private authService: AuthenticationService) { }
  getNotifications(timeSeq: number, limit: number) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.authService.loadToken();
    headers.append('Authorization', this.authService.authToken);
    return this.http.get('http://localhost:3333/notification/many?time=' + timeSeq + '&limit=' + limit, { headers: headers }).pipe(map(res => res.json()));
  }

  getNumberOfUnreadNotifications() {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.authService.loadToken();
    headers.append('Authorization', this.authService.authToken);
    return this.http.get('http://localhost:3333/notification/many/count', { headers: headers }).pipe(map(res => res.json()));
  }

  updateNotifications(topTime: number,bottomTime: number){ 
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.authService.loadToken();
    headers.append('Authorization', this.authService.authToken);
    let body = {
      topTime: topTime,
      bottomTime: bottomTime
    }
    return this.http.put('http://localhost:3333/notification/',body, { headers: headers }).pipe(map(res => res.json()));
  }

  createNotifications(toUserID: string,detail: any,time: number){ 
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.authService.loadToken();
    headers.append('Authorization', this.authService.authToken);
    let body = {
      toUserID: toUserID,
      detail: detail,
      time: time
    }
    return this.http.post('http://localhost:3333/notification/',body, { headers: headers }).pipe(map(res => res.json()));
  }
}
