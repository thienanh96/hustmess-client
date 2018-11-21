import { Component, OnInit, Input, HostListener, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ComponentCommunicationService } from '../../services/component-communication.service';
import { Router, ActivatedRoute } from '@angular/router';
import { RoomchatService } from '../../services/roomchat.service';
import { RoomchatUserService } from '../../services/roomchat-user.service';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-lastmessage',
  templateUrl: './lastmessage.component.html',
  styleUrls: ['./lastmessage.component.css']
})
export class LastmessageComponent implements OnInit {
  @Input() content: string;
  @Input() profileImage: string;
  @Input() roomchatName: string;
  @Input() timeActive: number;
  @Input() idle: boolean;
  @Input() reactive: boolean;
  @Input() roomchatID: string;
  @Input() myID: string;
  isActive: boolean = false;
  showManageRoomchatModal: boolean = false;
  showDeleteRoomchatModal: boolean = false;
  showDeleteMessageModal: boolean = false;
  announceModal = {
    deleteAllMessages: {
      show: false,
      ok: false,
      fail: false
    },
    deleteRoomchat: {
      show: false,
      ok: false,
      fail: false
    }
  }
  @ViewChild('messagebody') input;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (!document.getElementById('last-message-comp')) return;
    let lastMessageComp = document.getElementById('last-message-comp').clientWidth;
    let lastMessageProfileImage = document.getElementById('profile-image').clientWidth;
    let lastMessageSetting = document.getElementById('message-body-setting').clientWidth;
    let temp = lastMessageComp - (lastMessageProfileImage + lastMessageSetting + 40);
    this.input.nativeElement.style.width = temp + 'px';
  }

  constructor(private componentCommunicationService: ComponentCommunicationService,
    private router: Router,
    private roomchatService: RoomchatService,
    private roomchatUserService: RoomchatUserService,
    private messageService: MessageService,
    private cdR: ChangeDetectorRef) { }

  ngOnInit() {
    if (document.getElementById('last-message-comp')) {
      let lastMessageComp = document.getElementById('last-message-comp').clientWidth;
      let lastMessageProfileImage = document.getElementById('profile-image').clientWidth;
      let lastMessageSetting = document.getElementById('message-body-setting').clientWidth;
      let temp = lastMessageComp - (lastMessageProfileImage + lastMessageSetting + 40);
      this.input.nativeElement.style.width = temp + 'px';
    }

    setInterval(() => {
      if (Math.abs(this.timeActive - Date.now()) < 5000) {
        this.isActive = true;
      } else {
        if (!this.idle) {
          this.isActive = false;
        }
      }
      if (this.idle) {
        this.isActive = false;
      }
    }, 1000)
  }

  openManageRoomchat() {
    this.showManageRoomchatModal = true;
  }

  onClickCancelManageRoomchatModal() {
    this.showManageRoomchatModal = false;
  }

  onClickCancelDeleteRoomchatModal() {
    this.showDeleteRoomchatModal = false;
    this.showDeleteMessageModal = false;
    this.announceModal.deleteAllMessages.show = false;
    this.announceModal.deleteAllMessages.ok = false;
    this.announceModal.deleteAllMessages.fail = false;
    this.announceModal.deleteRoomchat.show = false;
    this.announceModal.deleteRoomchat.ok = false;
    this.announceModal.deleteRoomchat.fail = false;
  }

  openConversation() {
    this.componentCommunicationService.setData({
      fromComponent: 'last-message',
      toComponent: 'roomchat',
      type: 'on-click-lastmessage',
      roomchatID: this.roomchatID
    })
    let w = window.innerWidth;
    if (w < 900) {
      this.router.navigate(['/conversation', this.roomchatID]);
    } else {
      this.router.navigate(['/home/conversation', this.roomchatID]);
    }


  }

  showDeleteMessageModalFunc() {
    this.showManageRoomchatModal = false;
    this.showDeleteMessageModal = true;
  }


  showDeleteRoomchatModalFunc() {
    this.showManageRoomchatModal = false;
    this.showDeleteRoomchatModal = true;
  }

  deleteAllMessages() {
    this.messageService.updateMessages(this.roomchatID).subscribe(data => {
      if (data && data.success) {
        this.showDeleteMessageModal = false;
        this.announceModal.deleteAllMessages.show = true;
        this.announceModal.deleteAllMessages.ok = true;
        this.componentCommunicationService.setData({
          fromComponent: 'last-message',
          toComponent: 'conversation',
          type: 'delete-all-messages',
          roomchatID: this.roomchatID
        })
      } else {
        this.showDeleteMessageModal = false;
        this.announceModal.deleteAllMessages.show = true;
        this.announceModal.deleteAllMessages.fail = true;
      }

    })
  }


  deleteRoomchat() {
    this.roomchatService.deleteRoomchat(this.roomchatID).subscribe(data => {
      if (data && data.success) {
        this.showDeleteRoomchatModal = false;
        this.announceModal.deleteRoomchat.show = true;
        this.cdR.detectChanges();
        this.announceModal.deleteRoomchat.ok = true;
        this.componentCommunicationService.setData({
          fromComponent: 'last-message',
          toComponent: 'roomchat',
          type: 'delete-roomchat',
          roomchatID: this.roomchatID
        })
        this.router.navigate(['/home']);
      } else {
        console.log(data)
        this.showDeleteRoomchatModal = false;
        console.log('fail')
        this.announceModal.deleteRoomchat.show = true;
        this.announceModal.deleteRoomchat.fail = true;
      }
    })
  }

  markAsUnread() {

  }
}
