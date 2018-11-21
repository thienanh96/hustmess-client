import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Headers, URLSearchParams } from '@angular/http';
import { Observable, Subject, ReplaySubject, from, of, range } from 'rxjs';
import { map, filter, switchMap, catchError } from 'rxjs/operators';
import { tokenNotExpired } from 'angular2-jwt';
import { AuthenticationService} from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class RoomchatService {

  constructor(private http: Http, private router: Router, private authService: AuthenticationService) { }

  createRoomchat(name: string){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.authService.loadToken();
    headers.append('Authorization', this.authService.authToken);
    console.log('name_',name)
    let body = {
      name: name
    }
    return this.http.post('http://localhost:3333/roomchat',body, { headers: headers}).pipe(map(res => res.json()));
  }

  checkDuplicateRoomchat(userIDs){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.authService.loadToken();
    headers.append('Authorization', this.authService.authToken);
    let body = {
      userIDs: userIDs
    }
    return this.http.post('http://localhost:3333/roomchat/checkduplicate',body, { headers: headers}).pipe(map(res => res.json()));
  }

  getRoomchats(){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.authService.loadToken();
    headers.append('Authorization', this.authService.authToken);
    return this.http.get('http://localhost:3333/roomchat/many', { headers: headers }).pipe(map(res => res.json()));
  }

  getRoomchat(roomchatID){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.authService.loadToken();
    headers.append('Authorization', this.authService.authToken);
    return this.http.get('http://localhost:3333/roomchat/one?roomchatid=' + roomchatID, { headers: headers }).pipe(map(res => res.json()));
  }

  deleteRoomchat(roomchatID){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.authService.loadToken();
    headers.append('Authorization', this.authService.authToken);
    return this.http.delete('http://localhost:3333/roomchat?roomchatid=' + roomchatID, { headers: headers }).pipe(map(res => res.json()));
  }

  addSeenUsers(roomchatID,userID){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.authService.loadToken();
    headers.append('Authorization', this.authService.authToken);
    let body = {
      $push: {
        isSeenBy: userID
      }
    }
    return this.http.put('http://localhost:3333/roomchat?roomchatid=' + roomchatID,body, { headers: headers}).pipe(map(res => res.json()));
  }

  resetSeenUsers(roomchatID){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.authService.loadToken();
    headers.append('Authorization', this.authService.authToken);
    let body = {
      isSeenBy: []
    }
    return this.http.put('http://localhost:3333/roomchat?roomchatid=' + roomchatID,body, { headers: headers}).pipe(map(res => res.json()));
  }
}
