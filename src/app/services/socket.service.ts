import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  constructor() {
    this.socket = io(this.url)
  }
  private url = 'http://localhost:3333';
  private socket;


  sendUserID(userID, roomchatID) {
    this.socket.emit('send-userid', {
      userID: userID,
      roomchatID: roomchatID
    })
  }

  emitIdle(roomchatID, userID) {
    this.socket.emit('idle-status', {
      roomchatID: roomchatID,
      userID: userID
    })
  }

  emitReceiveMessage(roomchatID){
    this.socket.emit('confirm-received-message',{
      roomchatID: roomchatID
    })
  }

  emitSeenMessage(roomchatID,userID){
    this.socket.emit('confirm-seen-message',{
      roomchatID: roomchatID,
      userID: userID
    })
  }

  confirmReceiveMessage(){
    let observable = new Observable<any>(observer => {
      this.socket.on('confirm-received-message', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  receiveJoinRoomchatConfirm(){
    let observable = new Observable<any>(observer => {
      this.socket.on('join-roomchat', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  confirmSeenMessage(){
    let observable = new Observable<any>(observer => {
      this.socket.on('confirm-seen-message', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  receiveIdle() {
    let observable = new Observable<any>(observer => {
      this.socket.on('idle-status', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  reActive(roomchatID, userID) {
    this.socket.emit('reactive-status', {
      roomchatID: roomchatID,
      userID: userID
    })
  }

  receiveReactive() {
    let observable = new Observable<any>(observer => {
      this.socket.on('reactive-status', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  // reconnect(){
  //   this.socket = io(this.url);
  // }

  // onDisconnect(){
  //   let observable = new Observable<any>(observer => {
  //     this.socket.on('disconnect', (data) => {
  //       observer.next(data);
  //     });
  //     return () => {
  //       this.socket.disconnect();
  //     };
  //   })
  //   return observable;
  // }

  deleteRoomchat(roomchatID) {
    this.socket.emit('delete-roomchat', { roomchatID: roomchatID })
  }

  confirmCompleteLoad() {
    this.socket.emit('complete-load-component', {})
  }

  emitTyping(roomchatID, status) {
    this.socket.emit('typing', {
      roomchatID: roomchatID,
      status: status
    })
  }

  receiveTyping(cb) {
    return this.socket.on('receive-typing', data => {
      return cb(data);
    });
    // let observable = new Observable<any>(observer => {
    //   this.socket.on('receive-typing', (data) => {
    //     observer.next(data);
    //   });
    //   return () => {
    //     this.socket.disconnect();
    //   };
    // })
    // return observable;
  }

  receiveConfirmConnect() {
    let observable = new Observable<any>(observer => {
      this.socket.on('confirm-connect', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  joinRoomchat(roomchatID) {
    this.socket.emit('join-roomchat', {
      roomchatID: roomchatID
    })
  }


  createRoomchat(userIDs,roomchatID,userZone){
    this.socket.emit('create-roomchat',{
      userIDs: userIDs,
      roomchatID: roomchatID,
      userZone: userZone
    })
  }

  sendMessage(messageObj) {
    this.socket.emit('send-message', messageObj);
  }

  receiveMessage(cb) {
    return this.socket.on('receive-message', data => {
      return cb(data);
    });
    // let observable = new Observable<any>(observer => {
    //   this.socket.on('receive-message', (data) => {
    //     observer.next(data);
    //   });
    //   return () => {
    //     this.socket.disconnect();
    //   };
    // })
    // return observable;

  }

  receiveCreateRoomchat(){
    let observable = new Observable<any>(observer => {
      this.socket.on('create-roomchat', (data) => {
        console.log('receive')
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }


  receiveTimestamp() {
    let observable = new Observable<any>(observer => {
      this.socket.on('receive-timestamp', (data) => {
        console.log('receive')
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  receiveOpenCallConfirm(){
    let observable = new Observable<any>(observer => {
      this.socket.on('open-call-confirm', (data) => {
        console.log('receive')
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  emitCall(username,userID,roomchatID){
    this.socket.emit('call-request',{
      username: username,
      userID: userID,
      roomchatID
    })
  }

  emitNotification(roomchatID,notificationObject){
    this.socket.emit('notification',{
      roomchatID: roomchatID,
      notification: notificationObject
    })
  }

  emitAcceptCallStatus(accept: boolean,roomchatID: string, userID: string){
    this.socket.emit('peerID',{
      accept: accept,
      userID: userID,
      roomchatID: roomchatID
    })
  }

  emitOpenCallConfirm(roomchatID){
    this.socket.emit('open-call-confirm',{
      confirm: true,
      roomchatID: roomchatID
    })
  }



  emitAddUsersToGroup(roomchatID: string){
    this.socket.emit('add-users-to-roomchat',{
      roomchatID: roomchatID
    })
  }

  receiveAddUsersToGroup(){
    let observable = new Observable<any>(observer => {
      this.socket.on('add-users-to-roomchat', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  receivePeerID(){
    let observable = new Observable<any>(observer => {
      this.socket.on('peerID', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  receiveNotification(){
    let observable = new Observable<any>(observer => {
      this.socket.on('notification', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  receiveCallRequest(){
    let observable = new Observable<any>(observer => {
      this.socket.on('call-request', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  emitArrangeRoomchats(arrangedRoomchat){
    return this.socket.emit('arrange-roomchats',arrangedRoomchat)
  }

  receiveArrangeRoomchats(){
    let observable = new Observable<any>(observer => {
      this.socket.on('arrange-roomchats', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }
}
