import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../../services/user.service';
import { RoomchatService } from '../../services/roomchat.service';
import { RoomchatUserService } from '../../services/roomchat-user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SocketService }  from '../../services/socket.service';

@Component({
  selector: 'app-new-message',
  templateUrl: './new-message.component.html',
  styleUrls: ['./new-message.component.css']
})
export class NewMessageComponent implements OnInit {
  searchTerm: string = '';
  searchedList: Array<any> = [];
  taggedUsers: Array<any> = [];
  showResult: boolean = false;
  myID: string = '';
  showNavPrevious: boolean = false;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.adjust();
  }


  constructor(private userService: UserService,
    private cdR: ChangeDetectorRef,
    private roomchatService: RoomchatService,
    private roomchatUserService: RoomchatUserService,
    private socketService: SocketService,
    private router: Router) { }

  ngOnInit() {
    let w = window.innerWidth;
    if(w < 900){
      this.router.navigate(['newmessage'])
    } else {
      this.router.navigate(['home/newmessage'])
    }
    this.adjust();
    
    this.userService.getMe('low').subscribe(data => {
      if(data && data.success){
        this.myID = data.user._id;
      }
    })
  }

  adjust() {
    let newMessageHeight = window.innerHeight - 185;
    let inputNewMessageWidth = document.getElementById('newmessage-header').clientWidth - 92;
    let w = window.innerWidth;
    if(w < 900){
      inputNewMessageWidth = inputNewMessageWidth - 40;
      this.showNavPrevious = true;
    } else {
      this.showNavPrevious = false;
    }
    document.getElementById('newmessage-header-search').style.width = inputNewMessageWidth + 'px';
    document.getElementById('newmessage-body').setAttribute('style', 'height: ' + newMessageHeight + 'px');

  }

  onSearchUser() {
    this.userService.searchUsers(this.searchTerm, 'friend').subscribe(data => {
      if (data && data.success) {
        this.searchedList = data.users;
        this.cdR.detectChanges();
        let a = document.getElementById('newmessage-search-result');
        if (document.getElementById('newmessage-tags')) {
          let b = document.getElementById('newmessage-tags').clientHeight + 60;
          this.cdR.detectChanges();
          a.style.top = b + 'px';
        }

      }
    })
  }

  onClickPreviousNav(){
    return this.router.navigate(['roomchats'])
  }

  onClickSearchResult(username, userID) {
    let userIDs = this.taggedUsers.map(el => el.userID);
    if (!userIDs.includes(userID)) {
      this.taggedUsers.push({
        username: username,
        userID: userID
      });
    }

    this.searchedList = [];

  }

  createConversation() {
    if (this.taggedUsers.length === 0) return;
    let nameConversation = '';
    if (this.taggedUsers.length <= 2) {
      let head = this.taggedUsers.slice(0, 2).map(el => el.username).join(' và ').trim();
      console.log('head: ', this.taggedUsers.slice(0, 2).join(' và '))
      nameConversation = head;
    } else {
      let head = this.taggedUsers.slice(0, 2).map(el => el.username).join(', ').trim();
      let offset = this.taggedUsers.length - 2;
      nameConversation = head + ' và ' + offset + ' người khác';
    }
    let userIDs = this.taggedUsers.map(el => el.userID);
    this.roomchatService.checkDuplicateRoomchat(userIDs).subscribe(dataa => {
      if (dataa && dataa.success) {
        if (dataa.duplicate === true) {
          let w = window.innerWidth;
          if(w < 900){
            this.router.navigate(['/conversation', dataa.roomchatID]);
          } else {
            this.router.navigate(['/home/conversation', dataa.roomchatID]);
          }
        } else {
          this.roomchatService.createRoomchat(nameConversation).subscribe(data => {
            if (data && data.success) {
              let roomchatID = data.roomchat._id;
              this.roomchatUserService.addUsersToRoomchat(userIDs, roomchatID).subscribe(data => {
                if (data && data.success) {
                  this.socketService.createRoomchat(userIDs,roomchatID,this.myID + '_user');
                  let w = window.innerWidth;
                  if(w < 900){
                    this.router.navigate(['/conversation', roomchatID]);
                  } else {
                    this.router.navigate(['/home/conversation', roomchatID]);
                  }
                }
              })
            }
          })
        }
      }
    })


  }

}
