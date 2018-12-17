import { Component, OnInit } from "@angular/core";
import { UserService } from "../../services/user.service";
import { FriendService } from "../../services/friend.service";
import { SocketService } from '../../services/socket.service';
import { NotificationService } from '../../services/notification.service';
declare var $: any;
@Component({
  selector: "app-contacts",
  templateUrl: "./contacts.component.html",
  styleUrls: ["./contacts.component.css"]
})
export class ContactsComponent implements OnInit {
  searchTerm: string = "";
  contacts = [];
  notAcceptedFriendsFirst = [];
  notAcceptedFriendsSecond = [];
  acceptedFriends = [];
  myInfo: any = {};

  constructor(
    private userService: UserService,
    private friendService: FriendService,
    private socketService: SocketService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadContacts();
    this.userService.getMe('low').subscribe(me => {
      if(!me) return;
      if(me.success){
        this.myInfo = me.user;
      }
    })
  }

  async loadFriends() {
    var data1 = await this.friendService.getFriends("true").toPromise();
    this.acceptedFriends = data1.friends;
    var data2 = await this.friendService.getFriends("false").toPromise();
    this.notAcceptedFriendsFirst = data2.friendsFirst;
    this.notAcceptedFriendsSecond = data2.friendsSecond;
  }
  async loadContacts() {
    await this.loadFriends();
    console.log(this.acceptedFriends);
    var data = await this.userService.getAllUsers().toPromise();
    if (data.success) {
      this.contacts = data.users;
      for (let i = 0; i < this.contacts.length; i++) {
        if (this.acceptedFriends.includes(this.contacts[i]._id))
          this.contacts[i].acceptedFriend = true;
        else if (this.notAcceptedFriendsFirst.includes(this.contacts[i]._id))
          this.contacts[i].notAcceptedFriendFirst = true;
        else if (this.notAcceptedFriendsSecond.includes(this.contacts[i]._id))
          this.contacts[i].notAcceptedFriendSecond = true;
        else this.contacts[i].notFriend = true;
      }
    } else {
    }
  }

  async delete(user, x, i) {
    var data = await this.friendService.deleteFriend(user._id).toPromise();
    if (data.success) {
      this.contacts[i].notFriend = true;
      this.contacts[i].notAcceptedFriendFirst = false;
      this.contacts[i].notAcceptedFriendSecond = false;
      this.contacts[i].acceptedFriend = false;
      var btn = $("#" + user._id + x);
      console.log(btn);
      btn.removeClass();
      btn.addClass("btn btn-lg btn-primary");
      btn.text("Kết bạn");
    }
  }

  async accept(user, x, i) {
    var data = await this.friendService.acceptFriend(user._id).toPromise();
    if (data.success) {
      this.contacts[i].notFriend = false;
      this.contacts[i].notAcceptedFriendFirst = false;
      this.contacts[i].notAcceptedFriendSecond = false;
      this.contacts[i].acceptedFriend = true;
      var btn = $("#" + user._id + x);
      console.log(btn);
      btn.removeClass();
      btn.addClass("btn btn-lg btn-warning");
      btn.text("Huỷ kết bạn");
    }
  }

  async add(user, i) {
    var data = await this.friendService.addFriend(user._id).toPromise();
    console.log(data);
    if (data.success) {
      this.contacts[i].notAcceptedFriendSecond = true;
      this.contacts[i].notAcceptedFriendFirst = false;
      this.contacts[i].notFriend = false;
      this.contacts[i].acceptedFriend = false;
      var btn = $("#" + user._id + "1");
      btn.removeClass();
      btn.addClass("btn btn-lg btn-info");
      btn.text("Đã gửi lời mời");
      this.socketService.emitSendFriendRequest(this.myInfo,user._id);
      this.notificationService.createNotifications(user._id,{
        typeNotification: 'friend-request'
      },Date.now()).subscribe(data => {});
    }
  }
}
