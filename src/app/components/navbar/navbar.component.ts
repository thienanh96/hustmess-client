import { Component, OnInit } from '@angular/core';
import { ComponentCommunicationService } from '../../services/component-communication.service';

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
  constructor(private componentCommunicationService: ComponentCommunicationService) { }

  ngOnInit() {
    this.componentCommunicationService.getData().subscribe(data => {
      if(data && data.fromComponent === 'answer' && data.type === 'hide-navbar'){
        this.showNavbarComp = false;
      } else if(data && data.fromComponent === 'app' && data.type === 'receive-notification'){
        console.log('Nhan thong baos: ',data)
        let notification = this.processNotificationObject(data.notification);
        this.notifications.push(notification);
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

}
