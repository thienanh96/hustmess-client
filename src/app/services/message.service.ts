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
export class MessageService {

  constructor(private http: Http, private router: Router, private authService: AuthenticationService) { }

  getMessages(roomchatID: string, timeSeq: number, limit: number) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.authService.loadToken();
    headers.append('Authorization', this.authService.authToken);
    return this.http.get('http://localhost:3333/message/many?roomchatid=' + roomchatID + '&time=' + timeSeq + '&limit=' + limit, { headers: headers }).pipe(map(res => res.json()));
  }

  sendMessage(roomchatID, content, attach, fileType, fileName) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.authService.loadToken();
    headers.append('Authorization', this.authService.authToken);
    let body = {
      roomChatID: roomchatID,
      content: content,
      attach: attach,
      fileType: fileType,
      fileName: fileName
    }
    return this.http.post('http://localhost:3333/message', body, { headers: headers }).pipe(map(res => res.json()));
  }

  updateMessages(roomchatID) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.authService.loadToken();
    headers.append('Authorization', this.authService.authToken);
    return this.http.put('http://localhost:3333/message/many?roomchatid=' + roomchatID, {}, { headers: headers }).pipe(map(res => res.json()));
  }

  deleteOneMessage(messageID) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.authService.loadToken();
    headers.append('Authorization', this.authService.authToken);
    return this.http.delete('http://localhost:3333/message?messageid=' + messageID, { headers: headers }).pipe(map(res => res.json()));
  }

  updateOneMessage(messageID) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.authService.loadToken();
    headers.append('Authorization', this.authService.authToken);
    return this.http.put('http://localhost:3333/message?messageid=' + messageID, {}, { headers: headers }).pipe(map(res => res.json()));
  }

}
