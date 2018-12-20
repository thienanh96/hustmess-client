import { Component, OnInit,AfterViewInit } from '@angular/core';
import { ComponentCommunicationService } from '../../services/component-communication.service';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute, RouterStateSnapshot } from '@angular/router';
import * as Peer from 'peerjs';
import { UserService } from 'src/app/services/user.service';
import { SocketService } from '../../services/socket.service';
import { RoomchatUserService } from '../../services/roomchat-user.service';

@Component({
  selector: 'app-answer',
  templateUrl: './answer.component.html',
  styleUrls: ['./answer.component.css']
})
export class AnswerComponent implements OnInit, AfterViewInit {
  getDataSub: Subscription;
  getUsersInRoomchatSub: Subscription;
  updatePeerIDSub: Subscription;
  peer: Peer;
  userID: string = '';
  roomchatID: string = '';
  peerID: string = '';
  constructor(private communicationComponentService: ComponentCommunicationService,
    private userService: UserService,
    private socketService: SocketService,
    private roomchatUserService: RoomchatUserService,
    private router: Router) { }

  ngOnInit() {
    
    this.peer = new Peer({
      path: '/peerjs',
      host: 'hustmess-peer-server.herokuapp.com',
      port: 443,
      secure: true
    });
    let bigStream = <HTMLVideoElement>document.getElementById('big-stream');
    bigStream.height = window.innerHeight ;
    let bigVideoWidth = bigStream.clientWidth;
    this.roomchatID = this.getParams().params;

    this.userID = this.getParams().query;
    this.peer.on('open', id => {
      this.updatePeerIDSub = this.userService.updatePeerIDUser(id).subscribe(data => {
        console.log("id peer: ",data)
        if(data && data.success){
          this.socketService.emitAcceptCallStatus(true,this.roomchatID,this.userID);
        } else {
          this.socketService.emitAcceptCallStatus(false,this.roomchatID,this.userID);
        }
      })
    });
    this.peer.on('call', call => {
      console.log("answer co cuoc goi!!!",call.metadata)
      this.openStream().then(stream => {
          call.answer(stream);
          
          call.on('stream', remoteStream => {
            console.log('check strea: ',remoteStream)
            let bigVideo = <HTMLVideoElement>document.getElementById('big-stream');
            let smallVideo = <HTMLVideoElement>document.getElementById('small-stream');
            bigVideo.srcObject = remoteStream;
            smallVideo.srcObject = stream;
            smallVideo.play();
            bigVideo.play();
          });
      });
  });
  }

  ngAfterViewInit(){
    this.communicationComponentService.setData({
      fromComponent: 'answer',
      toComponent: 'navbar',
      type: 'hide-navbar'
    })
  }

  openStream() {
    const config = {
      audio: true,
      video: true
    };
    return navigator.mediaDevices.getUserMedia(config);
  }

  close(){
    window.close();
  }

  getParams() {
    let url = this.router.routerState.snapshot.url.split('?');
    let tempLength = url[0].split('/').length;
    return {
      params: url[0].split('/')[tempLength - 1] + '',
      query: url[1].replace('userid=', '')
    }
  }

}
