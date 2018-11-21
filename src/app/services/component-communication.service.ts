import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import { Observable} from 'rxjs/Observable';

@Injectable()
export class ComponentCommunicationService {
  private data: BehaviorSubject<any> = new BehaviorSubject(null);
  constructor() { }

  public setData(data: any) {
    this.data.next(data);
  }

  public getData(): Observable<any>{
    return this.data.asObservable();
  }

}
