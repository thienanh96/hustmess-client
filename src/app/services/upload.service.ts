import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpRequest, HttpHeaders, HttpClient, HttpEvent, HttpEventType, HttpParams } from '@angular/common/http';
import { Http, Headers, URLSearchParams } from '@angular/http';
import { Observable, Subject, ReplaySubject, from, of, range } from 'rxjs';
import { map, filter, switchMap, catchError } from 'rxjs/operators';
import { tokenNotExpired } from 'angular2-jwt';
import { AuthenticationService } from './authentication.service';
import {DOMAIN} from '../../../src/domain';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor(private http: Http, private authService: AuthenticationService, private httpClient: HttpClient) { }
  uploadFile(formData: FormData, i: Number, roomchatID: string) {
    let headers = new Headers();
    this.authService.loadToken();
    headers.append('Authorization', this.authService.authToken);
    let req = new HttpRequest('POST', DOMAIN + 'uploads/files', formData, {
      reportProgress: true,
      headers: new HttpHeaders().set('Authorization', this.authService.authToken),
      params: new HttpParams().set('roomchatid', roomchatID)
    });
    return this.httpClient.request(req).pipe(map(event => this.getEventMessage(event, i)));
    // return this.http.post(DOMAIN + 'uploads/files', formData, { headers: headers }).pipe(map(res => res.json()));
  }

  getEventMessage(event: HttpEvent<any>, index: Number) {
    switch (event.type) {
      case HttpEventType.Sent:
        return 0;

      case HttpEventType.UploadProgress:
        // Compute and show the % done:
        const percentDone = Math.round(100 * event.loaded / event.total);
        console.log('index', index)
        return {
          percentDone: percentDone,
          index: index
        }
      case HttpEventType.Response:
        return event.body;
      default:
        return 0;
    }
  }

  getFiles(roomchatID: string, typeFile: string, timeSeq: number, limit: number) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.authService.loadToken();
    headers.append('Authorization', this.authService.authToken);
    return this.http.get(DOMAIN + 'files/many?roomchatid=' + roomchatID + '&type=' + typeFile + '&time=' + timeSeq + '&limit=' + limit, { headers: headers }).pipe(map(res => res.json()));
  }

  getFile(roomchatID: string, typeFile: string, fileID: number) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.authService.loadToken();
    headers.append('Authorization', this.authService.authToken);
    return this.http.get(DOMAIN + 'files?roomchatid=' + roomchatID + '&type=' + typeFile + '&id=' + fileID, { headers: headers }).pipe(map(res => res.json()));
  }

}
