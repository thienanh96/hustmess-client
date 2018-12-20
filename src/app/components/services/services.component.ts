import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ComponentCommunicationService } from '../../services/component-communication.service';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute, RouterStateSnapshot } from '@angular/router';
// import * as Peer from 'peerjs';
import * as Peer from 'peerjs';
import { UserService } from 'src/app/services/user.service';
import { SocketService } from '../../services/socket.service';
import { RoomchatUserService } from '../../services/roomchat-user.service';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent implements OnInit, AfterViewInit {
  getDataSub: Subscription;
  peer: Peer;
  roomchatID: string = '';
  userID: string = '';
  peerIDs: Array<any> = [];
  getUsersInRoomchatSub: Subscription;
  getUsersDetailSub: Subscription;
  othersStream: Array<any> = [];
  constructor(private communicationComponentService: ComponentCommunicationService,
    private userService: UserService,
    private cdRef: ChangeDetectorRef,
    private socketService: SocketService,
    private roomchatUserService: RoomchatUserService,
    private router: Router) { }

  ngOnInit() {
    this.roomchatID = this.getParams().params;
    this.userID = this.getParams().query;
    this.peer = new Peer({
      path: '/peerjs',
      host: 'hustmess-peer-server.herokuapp.com',
      port: 443,
      secure: true
    });
    let bigStream = <HTMLVideoElement>document.getElementById('big-stream');
    bigStream.height = window.innerHeight ;
    let bigVideoWidth = bigStream.clientWidth;

    this.getUsersInRoomchatSub = this.roomchatUserService.getRoomchatUsers(this.roomchatID).subscribe(dataa => {
      if (dataa && dataa.success) {
        let usersInRoomchat = dataa.roomchatUsers.map(el => el.userID);
        this.getUsersDetailSub = this.userService.getUsersFromIDs(usersInRoomchat).subscribe(data => {
          if (data && data.success) {
            let users = data.users;
            users.forEach(el => {
              if (this.userID !== el._id) {
                let userDetail = el.detail;
                if (userDetail && userDetail.peerID && userDetail.peerID !== '') {
                  this.peerIDs.push({
                    userID: el._id,
                    peerID: userDetail.peerID
                  })
                }
              }
            })
            if (this.peerIDs.length === 1) {
              this.othersStream.push('');
              this.cdRef.detectChanges();
              this.openStream().then(stream => {
                let call = this.peer.call(this.peerIDs[0].peerID + '', stream);
                call.on('stream', remoteStream => { 
                  let bigVideoEl = <HTMLVideoElement>document.getElementById('big-stream');
                  let smallStream = <HTMLVideoElement>document.getElementById('small-stream');
                  bigVideoEl.srcObject = remoteStream;
                  bigVideoEl.play();
                  smallStream.srcObject = stream;
                  smallStream.play();
                });


              });
            } else {

            }
            // this.openStream().then(stream => {
            //   for (let peerID of this.peerIDs) {
            //     let call = this.peer.call(peerID.peerID + '', stream);
            //     call.on('stream', remoteStream => {
            //       console.log('check strea: ', remoteStream)
            //       let videoEl = <HTMLVideoElement>document.getElementById('localStream');
            //       videoEl.srcObject = remoteStream;
            //       videoEl.play();
            //     });
            //   }

            // });
            //call thoi!
          }
        })
      }
    })


    // this.peer.on('open', id => {
    //   this.socketService.emitPeerID(id, this.roomchatID, this.userID);
    // })



    // this.openStream().then(stream => {
    //   this.userService.getUser('low', this.userID).subscribe(user => {
    //     if (user && user.success) {
    //       console.log('RTT')
    //       let peerID = user.user.detail.peerID;
    //       let videoEl = <HTMLVideoElement>document.getElementById('localStream');
    //       videoEl.srcObject = stream;
    //       videoEl.play();
    //       let call = this.peer.call(peerID, stream);
    //       call.on('stream', remoteStream => {

    //       });
    //     }
    //   })
    // })

  }

  close(){
    window.close();
  }

  openStream() {
    const config = {
      audio: true,
      video: true
    };
    return navigator.mediaDevices.getUserMedia(config);
  }

  getParams() {
    let url = this.router.routerState.snapshot.url.split('?');
    let tempLength = url[0].split('/').length;
    return {
      params: url[0].split('/')[tempLength - 1] + '',
      query: url[1].replace('userid=', '')
    }
  }

  ngAfterViewInit() {
    this.communicationComponentService.setData({
      fromComponent: 'answer',
      toComponent: 'navbar',
      type: 'hide-navbar'
    })
  }


}
