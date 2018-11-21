import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ComponentCommunicationService } from '../../services/component-communication.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit,AfterViewInit {
  roomchatID: string = '';
  constructor(private componentCommunicationService: ComponentCommunicationService) { }

  ngOnInit() {
    // this.componentCommunicationService.getData().subscribe(data => {
    //   if(!data) return;
    //   if((data.fromComponent === 'roomchat'|| data.fromComponent === 'conversation') && data.type === 'responsive-show-roomchat'){
    //     document.getElementById('roomchat-component').style.width = '100%';
    //     document.getElementById('conversation-component').style.display = 'none';
    //   } else if((data.fromComponent === 'roomchat'|| data.fromComponent === 'conversation') && data.type === 'responsive-show-roomchat-revert'){
    //     document.getElementById('roomchat-component').style.display = 'block';
    //     document.getElementById('roomchat-component').style.width = '25%';
    //     document.getElementById('conversation-component').style.display = 'block';
    //     document.getElementById('conversation-component').style.width = '75%';
    //   } else if((data.fromComponent === 'last-message' || data.fromComponent === 'conversation') && data.type === 'responsive-show-conversation'){
    //     document.getElementById('conversation-component').style.display = 'block';
    //     document.getElementById('conversation-component').style.width = '100%';
    //     document.getElementById('roomchat-component').style.display = 'none';
    //   }
    // })
  }

  ngAfterViewInit(){

  }



}
