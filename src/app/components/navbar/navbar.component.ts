import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ComponentCommunicationService } from '../../services/component-communication.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  notifications: Array<any> = [];
  showNavbarComp: boolean = true;
  openNotification: boolean = false;
  loadNotificationComplete: boolean = true;
  continueToLoad: boolean = true;
  previousTimeSeq: number = 0;
  loadingNotifications: boolean = false;
  constructor(private componentCommunicationService: ComponentCommunicationService,
              private cdRef: ChangeDetectorRef,
              private notificationService: NotificationService) { }

  ngOnInit() {
    this.previousTimeSeq = Date.now() + 100000;
    this.loadingNotifications = true;
    this.notificationService.getNotifications(this.previousTimeSeq,10).subscribe(data => {
      if (data && data.success) {
        this.loadingNotifications = false;
        for(let notificationObj of data.notifications){
          let preNotification = {
            detail: notificationObj.notification.detail,
            fromUserInfo: notificationObj.fromUserInfo,
            toUserID: notificationObj.notification.toUserID,
            time: notificationObj.notification.time,
            type: notificationObj.notification.detail.typeNotification
          }
          preNotification.fromUserInfo.profileImage = preNotification.fromUserInfo.profileImage.lowQuality;
          let finalNotification = this.processNotificationObject(preNotification);
          console.log('gigig: ',finalNotification)
          this.notifications.push(finalNotification)
        }
        console.log('load-Notification info:__init: ',data)
        // let images = data.files
        // let filesLength = images.length;
        // if(filesLength === 0) return;
        // this.images = this.images.concat(images);
        // this.previousTimeSeq = images[filesLength - 1].time;
        // console.log('time-seq: ',this.previousTimeSeq,images.map(el => el.time));
      }
    })
    this.componentCommunicationService.getData().subscribe(data => {
      if(data && data.fromComponent === 'answer' && data.type === 'hide-navbar'){
        this.showNavbarComp = false;
      } else if(data && data.fromComponent === 'app' && data.type === 'receive-notification'){
        console.log('Nhan thong baos: ',data)
        let notification = this.processNotificationObject(data.notification);
        this.notifications.unshift(notification);
      }
    })
  }

  closeNotification($event){

  }

  openNotificationModal(){
    this.openNotification = true;
  }

  onClickNotification(notification){

  }

  processNotificationObject(notificationObject){
    console.log('notig: ',notificationObject)
    let typeNotification = notificationObject.type;
    let fromUserInfo = notificationObject.fromUserInfo;
    let toUserID = notificationObject.toUserID;
    let time = notificationObject.time;
    let detail = notificationObject.detail;
    if(typeNotification === 'incomming-message'){
      let content = '';
      if(detail && detail !== {} && detail.typeContent === 'text'){
        content = detail.content;
      } else if(detail && detail !== {} && detail.typeContent === 'file'){
        content = fromUserInfo.username + ' đã gửi ảnh cho bạn'
      }
      return {
        content: content,
        username: fromUserInfo.username,
        type: 'incomming-message',
        time: time,
        profileImage: fromUserInfo.profileImage
      }
    } else {
      return {
        content: '',
        time: time
      }
    }
  }

  onScrolNotificationPopover(){
    let scrollTop = document.getElementById('notification-body').scrollTop;
    let scrollHeight = document.getElementById('notification-body').scrollHeight;
    let clientHeight = document.getElementById('notification-body').clientHeight;
    if (
      scrollHeight - 10 < clientHeight + scrollTop &&
      this.continueToLoad
    ) {
      this.continueToLoad = false;
      this.cdRef.detectChanges();
      this.notificationService.getNotifications(this.previousTimeSeq,10).subscribe(data => {
        if (data && data.success) {
          this.continueToLoad = true;
          console.log('load-Notification info:__: ',data)
          // let images = data.files
          // let filesLength = images.length;
          // if(filesLength === 0) return;
          // this.images = this.images.concat(images);
          // this.previousTimeSeq = images[filesLength - 1].time;
          // console.log('time-seq: ',this.previousTimeSeq,images.map(el => el.time));
        }
      })
    }
  }

}
