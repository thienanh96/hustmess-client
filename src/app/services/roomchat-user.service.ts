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
export class RoomchatUserService {

  constructor(private http: Http, private authService: AuthenticationService) { }
  getRoomchatUsers(roomchatID) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.authService.loadToken();
    headers.append('Authorization', this.authService.authToken);
    return this.http.get('http://localhost:3333/roomchatuser/many?roomchatid=' + roomchatID, { headers: headers }).pipe(map(res => res.json()));
  }

  addUsersToRoomchat(userIds, roomchatID) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.authService.loadToken();
    headers.append('Authorization', this.authService.authToken);
    let body = {
      userIDs: userIds,
      roomChatID: roomchatID
    }
    return this.http.post('http://localhost:3333/roomchatuser', body, { headers: headers }).pipe(map(res => res.json()));
  }

  deleteUserFromRoomchat(roomchatID, userID) {
    console.log('delete user_',roomchatID,userID)
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.authService.loadToken();
    headers.append('Authorization', this.authService.authToken);
    return this.http.delete('http://localhost:3333/roomchatuser?roomchatid=' + roomchatID + '&userid=' + userID, { headers: headers }).pipe(map(res => res.json()));
  }

  assignAdmin(roomchatID: string, userID: string) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.authService.loadToken();
    headers.append('Authorization', this.authService.authToken);
    return this.http.put('http://localhost:3333/roomchatuser?roomchatid=' + roomchatID + '&userid=' + userID + '&type=assign-admin', {}, { headers: headers }).pipe(map(res => res.json()));
  }

  deleteAssignAdmin(roomchatID: string, userID: string) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.authService.loadToken();
    headers.append('Authorization', this.authService.authToken);
    return this.http.put('http://localhost:3333/roomchatuser?roomchatid=' + roomchatID + '&userid=' + userID + '&type=delete-assign-admin', {}, { headers: headers }).pipe(map(res => res.json()));
  }

}
