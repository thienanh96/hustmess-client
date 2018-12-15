import {
  Component,
  OnInit,
  HostListener,
  ChangeDetectorRef,
  ViewChild,
  AfterViewInit
} from "@angular/core";
import { RoomchatService } from "../../services/roomchat.service";
import { ComponentCommunicationService } from "../../services/component-communication.service";
import { SocketService } from "../../services/socket.service";
import { FriendService } from "../../services/friend.service";
import { Router, ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";

@Component({
  selector: "app-roomchat",
  templateUrl: "./roomchat.component.html",
  styleUrls: ["./roomchat.component.css"]
})
export class RoomchatComponent implements OnInit, AfterViewInit {
  searchTerm: string = "";
  myID: string = "";
  roomchats = [];
  showManageRoomchatModal: boolean = false;
  url: string = "";
  insertRoomchatViaSocket: Subscription;
  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.adjust();
    if (this.url === "/home") {
      this.listenResponsive();
    }
  }

  constructor(
    private roomchatService: RoomchatService,
    private componentCommunicationService: ComponentCommunicationService,
    private socketService: SocketService,
    private friendService: FriendService,
    private router: Router,
    private cdR: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
    if (this.url === "/home") {
      console.log("reeeeeeeeeee");
      this.listenResponsive();
    }
  }

  ngOnInit() {
    let w = window.innerWidth;
    if (w < 900) {
      this.router.navigate(["roomchats"]);
    } else {
      this.router.navigate(["home"]);
    }
    this.confirmInit();
    this.url = this.router.routerState.snapshot.url;

    this.loadRoomchats();

    this.componentCommunicationService.getData().subscribe(data => {
      if (!data) return;
      if (data.fromComponent === "app" && data.type === "timestamp") {
        for (let roomchat of this.roomchats) {
          if (roomchat.lastUserID === data.fromUserID + "") {
            roomchat.timeActive = data.time;
            // break;
          }
        }
      } else if (data.fromComponent === "app" && data.type === "idle") {
        for (let roomchat of this.roomchats) {
          if (roomchat.lastUserID === data.fromUserID + "") {
            roomchat.idle = true;
            roomchat.reactive = false;
            // break;
          }
        }
      } else if (data.fromComponent === "app" && data.type === "reactive") {
        for (let roomchat of this.roomchats) {
          if (roomchat.lastUserID === data.fromUserID + "") {
            roomchat.idle = false;
            roomchat.reactive = true;
            // break;
          }
        }
      } else if (
        data.fromComponent === "app" &&
        data.type === "timestamp-on-init"
      ) {
        for (let roomchat of this.roomchats) {
          for (let timeActive of data.dataTimeActive) {
            if (roomchat.lastUserID === timeActive._id + "") {
              roomchat.timeActive = timeActive.timeActive;
              // break;
            }
          }
        }
      } else if (
        data.fromComponent === "input" &&
        data.type === "arrange-roomchat"
      ) {
        this.arrangeRoomchats({
          lastUserID: data.lastUserID,
          content: data.content,
          roomchatID: data.roomchatID,
          profileImage: data.profileImage
        });
      } else if (
        data.fromComponent === "app" &&
        data.type === "arrange-roomchat"
      ) {
        this.arrangeRoomchats({
          lastUserID: data.arrangedRoomchat.lastUserID,
          content: data.arrangedRoomchat.content,
          roomchatID: data.arrangedRoomchat.roomchatID,
          profileImage: data.arrangedRoomchat.profileImage
        });
        if (document.getElementById(data.arrangedRoomchat.roomchatID)) {
          document.getElementById(
            data.arrangedRoomchat.roomchatID
          ).style.backgroundColor = "#e7e7e7";
        }
        for (let roomchat of this.roomchats) {
          if (roomchat._id === data.arrangedRoomchat.roomchatID) continue;
          let el = document.getElementById(roomchat._id);
          if (el && el.style.backgroundColor === "rgb(231, 231, 231)") {
            el.style.backgroundColor = "white";
            break;
          }
        }
      } else if (
        data.fromComponent === "conversation" &&
        data.type === "confirm-loadparams"
      ) {
        this.cdR.detectChanges();
        if (document.getElementById(data.roomchatID)) {
          document.getElementById(data.roomchatID).style.backgroundColor =
            "#e7e7e7";
        }
      } else if (
        (data.fromComponent === "last-message" ||
          data.fromComponent === "navbar") &&
        data.type === "on-click-lastmessage"
      ) {
        if (!data.roomchatID) return;
        if (document.getElementById(data.roomchatID)) {
          document.getElementById(data.roomchatID).style.backgroundColor =
            "#e7e7e7";
        }
        for (let roomchat of this.roomchats) {
          if (roomchat._id === data.roomchatID) continue;
          let el = document.getElementById(roomchat._id);
          if (el && el.style.backgroundColor === "rgb(231, 231, 231)") {
            el.style.backgroundColor = "white";
            break;
          }
        }
      } else if (
        data.fromComponent === "last-message" &&
        data.type === "delete-roomchat"
      ) {
        let index = 0;
        for (let roomchat of this.roomchats) {
          if (roomchat._id === data.roomchatID) {
            this.roomchats.splice(index, 1);
            break;
          }
          index++;
        }
        this.router.navigate(["/home/conversation", this.roomchats[0]._id]);
        this.socketService.deleteRoomchat(data.roomchatID);
      } else if (
        data.fromComponent === "app" &&
        data.type === "create-roomchat"
      ) {
        this.insertRoomchatViaSocket = this.roomchatService
          .getRoomchat(data.roomchatID)
          .subscribe(dataa => {
            if (dataa && dataa.success) {
              this.roomchats.push({
                lastUserID: dataa.roomchat.firstUserInRoomchat._id + "",
                lastUserName: dataa.roomchat.firstUserInRoomchat.username,
                profileImage:
                  dataa.roomchat.firstUserInRoomchat.profileImage.lowQuality,
                content: dataa.roomchat.roomchat.lastMessage.content,
                _id: dataa.roomchat.roomchat._id,
                roomchatName: this.processRoomchatName(
                  dataa.roomchat.firstUserInRoomchat.username,
                  dataa.roomchat.numberOfUserInRoomchat,
                  dataa.roomchat.typeRoomchat
                ),
                timeActive: 0,
                idle: false,
                reactive: false
              });
            }
          });
      } else if (
        (data.fromComponent === "conversation" ||
          data.fromComponent === "new") &&
        data.type === "reload-component"
      ) {
        this.roomchats = [];
        this.loadRoomchats();
      }
    });
  }


  createRoomchat() {
    let w = window.innerWidth;
    if (w < 900) {
      this.router.navigate(["/newmessage"]);
    } else {
      this.router.navigate(["/home/newmessage"]);
    }
  }

  confirmInit() {
    this.componentCommunicationService.setData({
      fromComponent: "conversation",
      type: "confirm-init"
    });
  }

  arrangeRoomchats(newRoomchat: any) {
    let index = 0;
    for (let roomchat of this.roomchats) {
      if (roomchat._id === newRoomchat.roomchatID) {
        let oldRoomchat = roomchat;
        this.roomchats.splice(index, 1);
        oldRoomchat.lastUserID = newRoomchat.lastUserID;
        oldRoomchat.profileImage = newRoomchat.profileImage;
        oldRoomchat.content = newRoomchat.content;
        console.log("room_: ", oldRoomchat);
        this.roomchats.unshift(oldRoomchat);
        break;
      }
      index++;
    }
  }

  adjust() {
    if (!document.getElementById("last-message-comp")) return;
    let lastMessageComp = document.getElementById("last-message-comp")
      .clientWidth;
    let lastMessageProfileImage = document.getElementById("profile-image")
      .clientWidth;
    let lastMessageSetting = document.getElementById("message-body-setting")
      .clientWidth;
    let temp =
      lastMessageComp - (lastMessageProfileImage + lastMessageSetting + 30);
    document.getElementById("message-body").style.width = temp + "px";
  }

  processRoomchatName(firstUser, numberOfUsers, typeRoomchat) {
    if (typeRoomchat === "private") {
      return firstUser;
    } else if (typeRoomchat === "group") {
      return firstUser + " và " + numberOfUsers + " người khác";
    }
  }

  listenResponsive() {
    let width = window.innerWidth;
    if (width < 900) {
      this.componentCommunicationService.setData({
        fromComponent: "roomchat",
        toComponent: "home",
        type: "responsive-show-roomchat"
      });
      document.getElementById("roomchat-header-label").style.display = "none";
      document.getElementById("roomchat-header-next").style.display = "block";
    } else {
      this.componentCommunicationService.setData({
        fromComponent: "roomchat",
        toComponent: "home",
        type: "responsive-show-roomchat-revert"
      });
      document.getElementById("roomchat-header-label").style.display = "block";
      document.getElementById("roomchat-header-next").style.display = "none";
    }
  }

  loadRoomchats() {
    this.roomchatService.getRoomchats().subscribe(data => {
      if (data.success) {
        this.myID = data.myID;
        for (let roomchat of data.roomchats) {
          this.socketService.joinRoomchat(roomchat.roomchat._id);
          this.roomchats.push({
            lastUserID: roomchat.firstUserInRoomchat._id + "",
            lastUserName: roomchat.firstUserInRoomchat.username,
            profileImage: roomchat.firstUserInRoomchat.profileImage.lowQuality,
            content: roomchat.roomchat.lastMessage.content,
            _id: roomchat.roomchat._id,
            roomchatName: this.processRoomchatName(
              roomchat.firstUserInRoomchat.username,
              roomchat.numberOfUserInRoomchat,
              roomchat.typeRoomchat
            ),
            timeActive: 0,
            idle: false,
            reactive: false
          });
        }
        if (this.roomchats[0]) {
          this.componentCommunicationService.setData({
            fromComponent: "roomchat",
            toComponent: "conversation",
            type: "confirm-loadroomchats",
            roomchatID: this.roomchats[0]._id
          });
        }
        if (this.roomchats.length !== 0) {
          let windowWidth = window.innerWidth;
          console.log("hceck url: ", this.router.routerState.snapshot.url);
          if (this.url === "/home" || this.url === "/home/roomchats") {
            if (windowWidth >= 900) {
              this.router.navigate([
                "/home/conversation",
                this.roomchats[0]._id
              ]);
              this.cdR.detectChanges();
              document.getElementById(
                this.roomchats[0]._id
              ).style.backgroundColor = "#e7e7e7";
            } else {
            }
          }
        }
      } else {
      }
    });
  }
}
