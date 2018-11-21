import { Component, OnInit, Input, OnDestroy, ViewChild, AfterViewInit, AfterContentChecked } from '@angular/core';
import { Subscription } from 'rxjs';
import { ComponentCommunicationService } from '../../services/component-communication.service';

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
  communicationSubscription: Subscription;
  @ViewChild('profileImageMessage') profileImageMessage;
  @ViewChild('usernameMessage') usernameMessage;
  constructor(private componentCommunicationService: ComponentCommunicationService) { }

  ngOnInit() {
    console.log('boolean: ',this.message.displayLastInfo)
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
}
