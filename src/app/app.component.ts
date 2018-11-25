import { Component, HostListener, OnInit, DoCheck, KeyValueDiffers, KeyValueDiffer } from '@angular/core';
import { ComponentCommunicationService } from './services/component-communication.service';
import { SocketService } from './services/socket.service';
import { FriendService } from './services/friend.service';
import { UserService } from './services/user.service';
import { Router, ActivatedRoute, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';
import { NotificationService } from './services/notification.service';
import * as Peer from 'peerjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  myID: string = '';
  myProfile: any = {};
  timeActive: number = Date.now();
  moveMouseTime: number = Date.now();
  idle: boolean = false;
  callUsername: string = '';
  showCallAccept: boolean = false;
  calledUserIDs: Array<string> = [];
  connectedUserCall: Array<string> = [];
  callRoomchatID: string = '';
  dataTimeActive = [];
  peer: Peer;
  peerID: string = '';
  constructor(private componentCommunicationService: ComponentCommunicationService,
    private notificationService: NotificationService,
    private router: Router,
    private socketService: SocketService,
    private friendService: FriendService,
    private userService: UserService,
    private authService: AuthenticationService) {
  }

  @HostListener('mousemove', ['$event'])
  onMousemove(event: MouseEvent) {
    this.moveMouseTime = Date.now();
    if (this.idle) {
      if (this.myID !== '') {
        this.socketService.reActive(this.myID + '_user', this.myID);
        this.idle = false;
      }
    }

  }


  ngOnInit() {
    this.authService.getTokenStatus().subscribe(data => {
      if (data) {
        if (data.isAdded === true) {
          this.friendService.getFriends('true').subscribe(data => {
            if (data && data.success) {
              for (let friend of data.friends) {
                this.socketService.joinRoomchat(friend + '_user');
              }
              this.myID = data.myID;
              this.socketService.receiveConfirmConnect().subscribe(data => {
                if (data && data.success) {
                  this.socketService.sendUserID(this.myID, this.myID + '_user');
                  setInterval(() => {
                    this.socketService.sendUserID(this.myID, this.myID + '_user');
                  }, 2000)
                }
              });

            }
          });
        }
      }
    })

    this.componentCommunicationService.getData().subscribe(data => {
      if (!data) return;
      if (data.type === 'confirm-init') {
        this.userService.getUsers('none').subscribe(data => {
          if (data && data.success) {
            this.dataTimeActive = data.users.map(el => {
              return {
                _id: el._id,
                timeActive: el.timeActive
              }
            });
            this.componentCommunicationService.setData({
              fromComponent: 'app',
              type: 'timestamp-on-init',
              dataTimeActive: this.dataTimeActive
            });
          }
        })
      } else if (data.fromComponent === 'input' && data.type === 'confirm-seen-message') {
        this.componentCommunicationService.setData({
          fromComponent: 'app',
          toComponent: 'conversation',
          type: 'check-valid-seen',
          data: data
        })
      } else if (data.fromComponent === 'conversation' && data.type === 'is-valid-seen') {
        this.socketService.emitSeenMessage(data.roomchatID, data.userID);
      } else if (data.fromComponent === 'conversation' && data.type === 'call-video') {
        this.calledUserIDs = data.usersInRoomchat;
        this.socketService.emitCall(this.myProfile.username, this.myProfile._id, data.roomchatID);

      }
    })

    this.socketService.receiveCreateRoomchat().subscribe(data => {
      if (!data) return;
      this.socketService.joinRoomchat(data.roomchatID);
      this.componentCommunicationService.setData({
        fromComponent: 'app',
        toComponent: 'roomchat',
        type: 'create-roomchat',
        roomchatID: data.roomchatID
      })
    })

    this.socketService.receiveMessage(data => {
      if (!data) return;
      this.componentCommunicationService.setData({
        fromComponent: 'app',
        type: 'receive-message',
        data: data
      });
      if (data.type === 'message') {
        this.socketService.emitReceiveMessage(data.roomchatID);
      }
    });

    this.socketService.receiveCallRequest().subscribe(data => {
      if (!data) return;
      this.callUsername = data.username;
      this.showCallAccept = true;
      this.callRoomchatID = data.roomchatID;
      console.log('call request', data);
    })

    this.socketService.receiveNotification().subscribe(data => {
      if (!data) return;
      let notificationObject = data.notification;
      let fromRoomchatID = data.fromRoomchatID;
      this.componentCommunicationService.setData({
        fromComponent: 'app',
        toComponent: 'navbar',
        type: 'receive-notification',
        notification: notificationObject
      });

    })

    this.socketService.confirmReceiveMessage().subscribe(data => {
      if (!data) return;
      this.componentCommunicationService.setData({
        fromComponent: 'app',
        toComponent: 'conversation',
        type: 'confirm-received-message',
        data: data
      });
    })

    this.socketService.confirmSeenMessage().subscribe(data => {
      console.log("DMMM")
      if (!data) return;
      this.componentCommunicationService.setData({
        fromComponent: 'app',
        toComponent: 'conversation',
        type: 'confirm-seen-message',
        data: data
      });
    })

    this.socketService.receiveTyping(data => {
      if (!data) return;
      this.componentCommunicationService.setData({
        fromComponent: 'app',
        type: 'typing',
        data: data
      });
    })

    this.socketService.receiveTimestamp().subscribe(data => {
      if (!data) return;
      this.timeActive = data.time;
      this.componentCommunicationService.setData({
        fromComponent: 'app',
        type: 'timestamp',
        fromUserID: data.userID,
        time: data.time
      })

    });

    setInterval(() => {
      if (Math.abs(Date.now() - this.moveMouseTime) > 1000 * 60) { // lon hon 1phut thi idle
        if (this.myID !== '') {
          this.idle = true;
          this.socketService.emitIdle(this.myID + '_user', this.myID);
        }

      };
    }, 2000);

    this.socketService.receiveIdle().subscribe(data => {
      if (!data) return;
      this.componentCommunicationService.setData({
        fromComponent: 'app',
        fromUserID: data.userID,
        type: 'idle',
      })
    })

    this.socketService.receiveReactive().subscribe(data => {
      if (!data) return;
      this.componentCommunicationService.setData({
        fromComponent: 'app',
        fromUserID: data.userID,
        type: 'reactive'
      })
    });

    this.socketService.receivePeerID().subscribe(data => {

      if (!data) return;
      if (data.userID === this.myID) return;
      let destUserID = data.userID;
      if (this.calledUserIDs.includes(destUserID + '')) { //xac nhan lai nguoi dc goi
        this.connectedUserCall.push(destUserID);
      }
      if (this.connectedUserCall.length === 1) {
        this.calledUserIDs = [];
        return window.open('services/' + data.roomchatID + '?userid=' + this.myID);
      }
    });

    this.socketService.receiveAddUsersToGroup().subscribe(data => {
      if (!data) return;
      return this.componentCommunicationService.setData({
        fromComponent: 'app',
        toComponent: 'info-conversation',
        roomchatID: data.roomchatID,
        type: 'add-users-to-roomchat'
      })
    })

    this.socketService.receiveArrangeRoomchats().subscribe(data => {
      if(!data) return;
      return this.componentCommunicationService.setData({
        fromComponent: 'app',
        toComponent: 'roomchat',
        type: 'arrange-roomchat',
        arrangedRoomchat: data
      })
    })


    // this.componentCommunicationService.getData().subscribe(data => {
    //   if (!data) return;
    //   if (data.type === 'resend-timestamp-oninit') {
    //     if(this.dataTimeActive.length === 0) return;
    //     this.componentCommunicationService.setData({
    //       fromComponent: 'app',
    //       type: 'timestamp-on-init',
    //       dataTimeActive: this.dataTimeActive
    //     });
    //   }
    // })

  }

  openStream() {
    const config = {
      audio: false,
      video: true
    };
    return navigator.mediaDevices.getUserMedia(config);
  }

  acceptCall() {
    return window.open('answer/' + this.callRoomchatID + '?userid=' + this.myID);
  }

  rejectCall() {

  }

  isCallOrAnswerRoute() {
    let url = this.router.routerState.snapshot.url.split('/');
    let el = url[1];
    console.log('iscall::', url)
    if (el === 'services' || el === 'answer') {
      return true;
    } else {
      return false;
    }
  }

  isInRoomchatID(roomchatID) {
    let url = this.router.routerState.snapshot.url
    return url === '/home/conversation/' + roomchatID || url === '/conversation/' + roomchatID
  }

}
