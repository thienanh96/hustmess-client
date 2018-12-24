import { Component, OnInit, Input, OnDestroy, ViewChild, AfterViewInit, AfterContentChecked,ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { ComponentCommunicationService } from '../../services/component-communication.service';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit,OnDestroy,AfterContentChecked,AfterViewInit {
  @Input() message: any;
  @Input() lastMessageID: string;
  @Input() lastUserID: string;
  @Input() previousLastMessageID: string;
  @Input() previousUserID: string;
  @Input() myID: string;
  @Input() roomchatID: string;
  communicationSubscription: Subscription;
  @ViewChild('profileImageMessage') profileImageMessage;
  @ViewChild('usernameMessage') usernameMessage;
  openMessageOptionModal: boolean = false;
  constructor(private componentCommunicationService: ComponentCommunicationService,
              private cdRef: ChangeDetectorRef,
              private messageService: MessageService) { }

  ngOnInit() {
    console.log('boolean: ',this.message)
  }

  ngOnDestroy(){

  }

  ngAfterViewInit(): void {
    // if(this.lastMessageID + '' === this.message._id + '' && (this.myID !== this.message.userID) && this.message.userID === this.lastUserID){
    //   this.profileImageMessage.nativeElement.style.display = 'block';
    //   this.usernameMessage.nativeElement.style.display = 'block';
    // }
    
  }

  ngAfterContentChecked(): void {
    // if(this.message._id + '' === this.previousLastMessageID + '' && this.message.userID === this.previousUserID){
    //   if(this.profileImageMessage && this.usernameMessage){
    //     this.profileImageMessage.nativeElement.style.display = 'none';
    //     this.usernameMessage.nativeElement.style.display = 'none';
    //   }
    // }
  }

  isMe(){
    return this.myID === this.message.userID + '';
  }

  displayLastInfo(){
    return this.message.displayLastInfo
  }

  openMessageOptions(){
    this.openMessageOptionModal = true
    this.cdRef.detectChanges();
    let w = window.innerWidth;
    if(w < 900){
      document.getElementById('custom-modal-content-open-message-options').style.width = '100%'
    } else {
      document.getElementById('custom-modal-content-open-message-options').style.width = '35%'
    }
  }

  deleteMessageLocally(){
    this.messageService.updateOneMessage(this.message._id).subscribe(data => {
      if(data && data.success){
        this.componentCommunicationService.setData({
          fromComponent: 'message',
          toComponent: 'conversation',
          type: 'delete-one-message',
          messageID: this.message._id
        });
        this.closeMessageOptions();
      }
    })
  }

  deleteMessagePermanently(){
    this.messageService.deleteOneMessage(this.message._id).subscribe(data => {
      console.log('delete vinh vien; ',data)
      if(data && data.success){
        
        this.componentCommunicationService.setData({
          fromComponent: 'message',
          toComponent: 'conversation',
          type: 'delete-one-message',
          messageID: this.message._id
        });
        this.closeMessageOptions();
      }
    })
  }

  closeMessageOptions(){
    this.openMessageOptionModal = false;
  }
}
