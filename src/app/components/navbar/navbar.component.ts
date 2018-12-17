import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ComponentCommunicationService } from '../../services/component-communication.service';
import { NotificationService } from '../../services/notification.service';
import { AuthenticationService } from '../../services/authentication.service';
import { FriendService } from '../../services/friend.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  notifications: Array<any> = [];
  numberOfUnreadNotifications: number = 0;
  showNavbarComp: boolean = true;
  openNotification: boolean = false;
  loadNotificationComplete: boolean = true;
  continueToLoad: boolean = true;
  previousTimeSeq: number = 0;
  loadingNotifications: boolean = false;
  roomchatNotifications: Array<string> = [];
  showAcceptFriendModal: boolean = false;
  friendRequestInfo = {
    fromUserID: '',
    fromUserUsername: '',
    destUserID: ''
  }
  constructor(private componentCommunicationService: ComponentCommunicationService,
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private authService: AuthenticationService,
    private friendService: FriendService,
    private notificationService: NotificationService) { }

  ngOnInit() {
    this.authService.getTokenStatus().subscribe(data => {
      if (data) {
        if (data.isAdded) {
          this.notificationService.getNumberOfUnreadNotifications().subscribe(data => {
            if (data && data.success) {
              this.numberOfUnreadNotifications = data.numberOfUnreadNotifications;
            }
          })
        }
      }
    })
    this.componentCommunicationService.getData().subscribe(data => {
      if (data && data.fromComponent === 'answer' && data.type === 'hide-navbar') {
        this.showNavbarComp = false;
      } else if (data && data.fromComponent === 'app' && data.type === 'receive-notification') {
        let notification = this.processNotificationObject(data.notification);
        if (!this.roomchatNotifications.includes(notification.fromRoomchatID)) {
          this.notifications.unshift(notification);
          this.numberOfUnreadNotifications++;
        }

      } else if (data && data.fromComponent === 'info-conversation' && data.type === 'turn-off-notification') {
        this.roomchatNotifications.push(data.roomchatID)
        console.log('LOG-off: ',this.roomchatNotifications)
      } else if (data && data.fromComponent === 'info-conversation' && data.type === 'turn-on-notification') {
        for(let i = 0;i < this.roomchatNotifications.length; i++){
          if(this.roomchatNotifications[i] === data.roomchatID){
            this.roomchatNotifications.splice(i,1);
            break;
          }
        }
      } else if (data && data.fromComponent === 'app' && data.type === 'friend-request'){
        let preNotification = {
          detail: {},
          fromUserInfo: data.data.fromUserInfo,
          toUserID: data.data.destUserID,
          time: 0,
          seen: false,
          type:'friend-request'
        }
        let finalNotification = this.processNotificationObject(preNotification);
        this.notifications.unshift(finalNotification)
        this.numberOfUnreadNotifications++;
      }
    })
  }

  closeNotification($event) {

  }

  openNotificationModal() {
    this.openNotification = true;
    this.cdRef.detectChanges();
    this.loadingNotifications = true;
    if (!this.authService.loggedIn()) return;
    this.previousTimeSeq = Date.now() + 100000;
    this.notifications = [];
    this.notificationService.getNotifications(this.previousTimeSeq, 10).subscribe(data => {
      if (data && data.success) {
        this.loadingNotifications = false;
        if (data.notifications.length === 0) return;
        for (let notificationObj of data.notifications) {
          let preNotification = {
            detail: notificationObj.notification.detail,
            fromUserInfo: notificationObj.fromUserInfo,
            toUserID: notificationObj.notification.toUserID,
            time: notificationObj.notification.time,
            seen: notificationObj.notification.seen,
            type: notificationObj.notification.detail.typeNotification
          }
          preNotification.fromUserInfo.profileImage = preNotification.fromUserInfo.profileImage.lowQuality;
          let finalNotification = this.processNotificationObject(preNotification);
          this.notifications.push(finalNotification)
        }
        this.numberOfUnreadNotifications = this.notifications.filter(el => !el.seen).length;
        this.previousTimeSeq = this.notifications[this.notifications.length - 1].time;

      }
    })
  }

  onClickNotification(notification) {
    let typeNotification = notification.type;
    let fromRoomchatID = notification.fromRoomchatID;
    this.openNotification = false;
    if (typeNotification === 'incomming-message') {
      if (this.getCurrentDevice() === 'desktop') {
        this.componentCommunicationService.setData({
          fromComponent: 'navbar',
          toComponent: 'roomchat',
          type: 'on-click-lastmessage',
          roomchatID: notification.fromRoomchatID
        })
        return this.router.navigate(['home/conversation', fromRoomchatID])
      } else if (this.getCurrentDevice() === 'mobile') {
        console.log('mobile')
        return this.router.navigate(['conversation', fromRoomchatID])
      }

    } else if(typeNotification === 'friend-request'){
      this.friendRequestInfo = {
        fromUserID: notification.fromUserID,
        fromUserUsername: notification.username,
        destUserID: notification.toUserID
      }
      this.showAcceptFriendModal = true;
    }
  }

  onClickNavigateToHome(){
    return this.router.navigate(["home"]);
  }

  processNotificationObject(notificationObject) {
    let typeNotification = notificationObject.type;
    let fromUserInfo = notificationObject.fromUserInfo;
    let toUserID = notificationObject.toUserID;
    let time = notificationObject.time;
    let detail = notificationObject.detail;
    if (typeNotification === 'incomming-message') {
      let content = '';
      if (detail && detail !== {} && detail.typeContent === 'text') {
        content = detail.content;
      } else if (detail && detail !== {} && detail.typeContent === 'file') {
        content = fromUserInfo.username + ' đã gửi ảnh cho bạn'
      }
      return {
        content: content,
        username: fromUserInfo.username,
        fromUserID: fromUserInfo._id,
        type: 'incomming-message',
        fromRoomchatID: detail.fromRoomchatID,
        time: time,
        seen: notificationObject.seen,
        toUserID: toUserID,
        profileImage: fromUserInfo.profileImage
      }
    } else if(typeNotification === 'friend-request') {
      return {
        content: '@'+fromUserInfo.username+' vừa gửi lời mới kết bạn, ấn để xem',
        type: 'friend-request',
        username: fromUserInfo.username,
        fromUserID: fromUserInfo._id,
        profileImage: fromUserInfo.profileImage,
        time: time,
        toUserID: toUserID,
        seen: notificationObject.seen
      }
    }
  }

  onScrolNotificationPopover() {
    let scrollTop = document.getElementById('notification-body').scrollTop;
    let scrollHeight = document.getElementById('notification-body').scrollHeight;
    let clientHeight = document.getElementById('notification-body').clientHeight;
    if (
      scrollHeight - 10 < clientHeight + scrollTop &&
      this.continueToLoad
    ) {
      this.continueToLoad = false;
      this.loadingNotifications = true;
      this.cdRef.detectChanges();
      this.notificationService.getNotifications(this.previousTimeSeq, 10).subscribe(data => {
        if (data && data.success) {
          this.loadingNotifications = false;
          this.continueToLoad = true;
          this.numberOfUnreadNotifications = data.numberOfUnreadNotifications;
          if (data.notifications.length === 0) {
            this.continueToLoad = false;
            this.loadingNotifications = false;
            return;
          }
          for (let notificationObj of data.notifications) {
            let preNotification = {
              detail: notificationObj.notification.detail,
              fromUserInfo: notificationObj.fromUserInfo,
              toUserID: notificationObj.notification.toUserID,
              time: notificationObj.notification.time,
              seen: notificationObj.notification.seen,
              type: notificationObj.notification.detail.typeNotification
            }
            preNotification.fromUserInfo.profileImage = preNotification.fromUserInfo.profileImage.lowQuality;
            let finalNotification = this.processNotificationObject(preNotification);
            this.notifications.push(finalNotification)

          }
          this.previousTimeSeq = this.notifications[this.notifications.length - 1].time;
        }
      })
    }
  }

  acceptFriend(){
    return this.friendService.acceptFriend(this.friendRequestInfo.fromUserID).subscribe(data => {
      if(data && data.success){
        this.showAcceptFriendModal = false;
        return alert("Accepted @" + this.friendRequestInfo.fromUserUsername + "'s friend request successfully!" )
      } else {
        this.showAcceptFriendModal = false;
        return alert("Error when accepting @" + this.friendRequestInfo.fromUserUsername + "'s friend request!" )
      }
    })
  }

  closeNotificationPopover($event) {
    let excludeID = $event.target.id;
    if (excludeID === 'notification-icon' || excludeID === 'count-notification-icon') return;
    this.openNotification = false
    if (this.notifications.length === 0) return;
    this.notificationService.updateNotifications(Date.now() + 1000, this.notifications[this.notifications.length - 1].time - 1).subscribe(data => {
      this.notificationService.getNumberOfUnreadNotifications().subscribe(data => {
        if (data && data.success) {
          this.numberOfUnreadNotifications = data.numberOfUnreadNotifications;
        }
      })
    })
  }

  getCurrentDevice() {
    let w = window.innerWidth;
    if (w < 900) {
      return 'mobile'
    } else {
      return 'desktop'
    }
  }


}
