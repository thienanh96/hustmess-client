import {
  Component,
  OnInit,
  ChangeDetectorRef,
  HostListener,
  OnDestroy,
  AfterViewInit
} from "@angular/core";
import { ComponentCommunicationService } from "../../services/component-communication.service";
import { MessageService } from "../../services/message.service";
import { UserService } from "../../services/user.service";
import { SocketService } from "../../services/socket.service";
import { RoomchatService } from "../../services/roomchat.service";
import { RoomchatUserService } from "../../services/roomchat-user.service";
import { Router, ActivatedRoute, RouterStateSnapshot } from "@angular/router";
import { Subscription } from "rxjs";

const urlCallVideo = "http://localhost:3333/services/call?userid=";

@Component({
  selector: "app-conversation",
  templateUrl: "./conversation.component.html",
  styleUrls: ["./conversation.component.css"]
})
export class ConversationComponent implements OnInit, OnDestroy, AfterViewInit {
  roomchatID: string = "";
  roomchatName: string = "";
  messages = [];
  lastMessageID: string = "";
  lastUserID: string = "";
  previousLastMessageID: string = ""; // tin nhan sau tin nhan cuoi cung
  previousUserID: string = "";
  IDSeenBy: Array<string> = [];
  infoSeenBy: Array<any> = [];
  showSeenModal: boolean = false;
  usersInRoomchat: Array<string> = [];
  myID: string = "";
  timeActive: number = 0;
  timeDuration: number = 10;
  isActive: boolean = false;
  isIdle: boolean = false;
  moveMouseTime: number = Date.now();
  subParams: Subscription;
  subParentParams: Subscription;
  isLoading: boolean = false;
  confirmation: any = {
    sent: false,
    sending: false,
    received: false,
    seen: false,
    typing: false,
    timeConfirm: Date.now()
  };
  receiveTimestampInterval: any;
  listenToStopTypingInterval: any;
  a: Subscription;
  b: Subscription;
  c: Subscription;
  d: Subscription;
  e: Subscription;
  f: Subscription;
  getUserSubscription: Subscription;
  continueToLoad: boolean = true;
  previousTimeSeq: number = Date.now() + 100000;
  loadingMessages: boolean = false;
  showConversationInfo: boolean = true;
  showNavPrevious: boolean = false;
  showWaitForCallModal: boolean = false;
  @HostListener("window:resize", ["$event"])
  onResize(event) {
    let inputHeight = document.getElementById("input-component").clientHeight;
    let conversationHeaderHeight = document.getElementById(
      "conversation-header"
    ).clientHeight;
    let navbarHeight = document.getElementById("navbar-component").clientHeight;
    let conversationHeight = window.innerHeight - 190;
    document
      .getElementById("conversation-body")
      .setAttribute("style", "height: " + conversationHeight + "px");
    let conversationWidth =
      document.getElementById("conversation-header").clientWidth - 110;
    if (this.showNavPrevious) {
      conversationWidth -= 40;
    }
    document
      .getElementById("conversation-header-username")
      .setAttribute("style", "width: " + conversationWidth + "px");
    if (this.showConversationInfo) {
      console.log("input-height: ", inputHeight);
      let conversationSideWidth =
        document.getElementById("conversation-header").clientWidth - 351;
      document.getElementById("conversation-side").style.width =
        conversationSideWidth + "px";
    } else {
      let conversationSideWidth = document.getElementById("conversation-header")
        .clientWidth;
      document.getElementById("conversation-side").style.width =
        conversationSideWidth + "px";
    }
    document.getElementById("input-component").style.width =
      document.getElementById("conversation-side").clientWidth + "px";
    // let w = window.innerWidth;
    // if (w >= 900) {
    //   this.showConversationInfo = true;
    //   let conversationSideWidth = document.getElementById('conversation-header').clientWidth - 351;
    //   document.getElementById('conversation-side').style.width = conversationSideWidth + 'px';
    // } else {
    //   this.showConversationInfo = false;
    //   let conversationSideWidth = document.getElementById('conversation-header').clientWidth;
    //   document.getElementById('conversation-side').style.width = conversationSideWidth + 'px';
    // }
  }
  constructor(
    private componentCommunicationService: ComponentCommunicationService,
    private messageService: MessageService,
    private socketService: SocketService,
    private cdR: ChangeDetectorRef,
    private roomchatUserService: RoomchatUserService,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private roomchatService: RoomchatService
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    }
  }

  ngOnInit() {
    this.roomchatID = this.getParams();
    let w = window.innerWidth;
    if (w < 900) {
      this.router.navigate(["conversation", this.roomchatID]);
    } else {
      this.router.navigate(["home/conversation", this.roomchatID]);
    }
    this.listenToStopTypingInterval = this.listenToStopTyping();
    this.isLoading = true;
    this.confirmInit();
    this.loadingMessages = true;
    this.cdR.detectChanges();
    this.adjustHTMLResponsive(w);
    this.a = this.roomchatService
      .getRoomchat(this.roomchatID)
      .subscribe(data => {
        if (data && data.success) {
          this.loadingMessages = false;
          this.messages = [];
          this.roomchatName = this.processRoomchatName(
            data.roomchat.firstUserInRoomchat.username,
            data.roomchat.numberOfUserInRoomchat - 1,
            data.roomchat.typeRoomchat
          );
          this.IDSeenBy = data.roomchat.roomchat.isSeenBy;
          if (this.IDSeenBy.length !== 0) {
            this.confirmation.seen = true;
          }
          this.myID = data.myID;
          this.socketService.confirmCompleteLoad();
          this.b = this.roomchatUserService
            .getRoomchatUsers(this.roomchatID)
            .subscribe(dataa => {
              if (dataa && dataa.success) {
                this.usersInRoomchat = dataa.roomchatUsers
                  .map(el => el.userID)
                  .filter(el => el !== this.myID);
                if (this.usersInRoomchat.length > 2) {
                  document.getElementById("call-icon").style.opacity = "0.6";
                } else {
                  document.getElementById("call-icon").style.cursor = "pointer";
                }
              }
            });
          this.componentCommunicationService.setData({
            fromComponent: "conversation",
            roomchatID: this.roomchatID
          });
          this.previousTimeSeq = Date.now() + 1000000;
          this.c = this.messageService
            .getMessages(this.roomchatID, this.previousTimeSeq, 20)
            .subscribe(data => {
              if (data.success) {
                let index = 0;
                let previousUserID = "";
                let messagesLength = data.messages.length;
                if (messagesLength === 0) return;
                for (let message of data.messages) {
                  this.messages.push({
                    userID: message.userProfile._id,
                    username: message.userProfile.username,
                    _id: message.message._id,
                    content: message.message.content,
                    attach: message.message.attach,
                    fileName: message.message.fileName,
                    fileType: message.message.fileType,
                    profileImage: message.userProfile.profileImage.lowQuality,
                    time: message.message.time,
                    displayLastInfo: false
                  });
                  if (index > 0) {
                    if (message.userProfile._id !== previousUserID) {
                      this.messages[index - 1].displayLastInfo = true;
                    }
                    if (
                      messagesLength - 1 === index &&
                      this.myID !== message.userProfile._id
                    ) {
                      this.messages[index - 1].displayLastInfo = false;
                      this.messages[index].displayLastInfo = true;
                    }
                  }

                  previousUserID = message.userProfile._id;
                  index++;
                }
                if (
                  this.messages[messagesLength - 1].userID + "" === this.myID &&
                  !this.confirmation.seen
                ) {
                  console.log("check snt");
                  this.confirmation.sent = true;
                  this.confirmation.received = false;
                }
                this.previousTimeSeq = this.messages[0].time;
                let scrollElement = document.getElementById(
                  "conversation-body"
                );
                this.cdR.detectChanges();
                scrollElement.scrollTop = scrollElement.scrollHeight;
              }
            });
        }
      });

    this.d = this.componentCommunicationService.getData().subscribe(data => {
      if (!data) return;
      if (data.fromComponent === "roomchat") {
        if (data.type === "confirm-loadroomchats") {
          this.confirmLoadParams(this.getParams());
        }
      } else if (data.fromComponent === "input") {
        if (data.status === "sending") {
          this.confirmation.sending = true;
        } else if (data.status === "sent") {
          this.confirmation.received = false;
          let contentText = data.contentText;
          let contentFile = data.contentFile;
          let fileType = data.fileType;
          let messageID = data.messageID;
          let fileName = data.fileName;
          let username = data.username;
          this.messages.push({
            userID: this.myID,
            username: username,
            _id: messageID,
            content: contentText,
            fileType: fileType,
            fileName: fileName,
            attach: contentFile,
            profileImage: "",
            time: Date.now()
          });
          let scrollElement = document.getElementById("conversation-body");
          this.cdR.detectChanges();
          scrollElement.scrollTop = scrollElement.scrollHeight;
        } else if (data.type === "adjust-conversation-body") {
          let conversationHeight =
            document.getElementById("conversation-body").clientHeight - 100;
          document
            .getElementById("conversation-body")
            .setAttribute("style", "height: " + conversationHeight + "px");
        }
      } else if (data.fromComponent === "app" && data.type === "idle") {
        if (
          this.usersInRoomchat.length !== 0 &&
          this.usersInRoomchat.includes(data.fromUserID + "")
        ) {
          this.isActive = false;
          this.isIdle = true;
        }
      } else if (data.fromComponent === "app" && data.type === "reactive") {
        if (
          this.usersInRoomchat.length !== 0 &&
          this.usersInRoomchat.includes(data.fromUserID + "")
        ) {
          this.isActive = true;
          this.isIdle = false;
        }
      } else if (data.fromComponent === "app" && data.type === "timestamp") {
        if (
          this.usersInRoomchat.length !== 0 &&
          this.usersInRoomchat.includes(data.fromUserID + "")
        ) {
          this.timeActive = data.time;
        }
      } else if (
        data.fromComponent === "app" &&
        data.type === "timestamp-on-init"
      ) {
        console.log("dataaa___ ", data);
        let waitForUsersInRoomchat = setInterval(() => {
          if (this.usersInRoomchat.length !== 0) {
            let mostRecentTime = 0;
            for (let userInRoomchat of this.usersInRoomchat) {
              for (let timeActive of data.dataTimeActive) {
                if (userInRoomchat === timeActive._id + "") {
                  if (timeActive.timeActive > mostRecentTime) {
                    mostRecentTime = timeActive.timeActive;
                  }
                }
              }
            }
            this.timeActive = mostRecentTime;
            this.isLoading = false;
            clearInterval(waitForUsersInRoomchat);
          }
        }, 10);
      } else if (
        data.fromComponent === "app" &&
        data.type === "receive-message"
      ) {
        if (data.data.roomchatID !== this.roomchatID) return;
        if (data.data.type === "confirm") {
          this.confirmation.sent = true;
          this.confirmation.sending = false;
        } else if (data.data.type === "message") {
          //khi co tin nhan moi den
          this.roomchatService
            .resetSeenUsers(this.roomchatID)
            .subscribe(data => { });
          if (this.messages.length !== 0) {
            this.messages[this.messages.length - 1].displayLastInfo = false;
          }

          this.confirmation.sent = false;
          this.confirmation.sending = false;
          this.confirmation.received = false;
          this.confirmation.seen = false;
          console.log('check username: ', data)
          this.messages.push({
            userID: data.data.fromUserID,
            _id: data.data.messageID,
            username: data.data.username,
            content: data.data.contentText,
            attach: data.data.contentFile,
            fileName: data.data.fileName,
            fileType: data.data.fileType,
            profileImage: data.data.profileImage,
            time: data.data.time,
            displayLastInfo: true
          });
          let scrollElement = document.getElementById("conversation-body");
          this.cdR.detectChanges();
          scrollElement.scrollTop = scrollElement.scrollHeight;
        }
      } else if (data.fromComponent === "app" && data.type === "typing") {
        if (data.data.roomchatID !== this.roomchatID) return;
        if (data.data.status === "typing") {
          this.confirmation.typing = true;
          this.confirmation.timeConfirm = data.data.time;
        }
      } else if (
        data.fromComponent === "last-message" &&
        data.type === "delete-all-messages"
      ) {
        if (data.roomchatID !== this.roomchatID) return;
        this.messages = [];
        this.e = this.messageService
          .getMessages(this.roomchatID, this.previousTimeSeq, 15)
          .subscribe(data => {
            if (data.success) {
              for (let message of data.messages) {
                this.messages.push({
                  userID: message.userProfile._id,
                  username: message.userProfile.username,
                  _id: message.message._id,
                  content: message.message.content,
                  fileName: message.message.fileName,
                  attach: message.message.attach,
                  fileType: message.message.fileType,
                  profileImage: message.userProfile.profileImage.lowQuality,
                  time: message.message.time
                });
              }
              this.confirmation.sent = false;
              this.confirmation.sending = false;
              this.previousTimeSeq = this.messages[0].time;
              let scrollElement = document.getElementById("conversation-body");
              this.cdR.detectChanges();
              scrollElement.scrollTop = scrollElement.scrollHeight;
            }
          });
      } else if (
        data.fromComponent === "app" &&
        data.type === "confirm-received-message"
      ) {
        if (data.data.roomchatID !== this.roomchatID) return;
        this.confirmation.received = true;
        this.confirmation.sent = false;
        this.confirmation.sending = false;
        this.confirmation.seen = false;
      } else if (
        data.fromComponent === "app" &&
        data.type === "confirm-seen-message"
      ) {
        if (data.data.roomchatID !== this.roomchatID) return;
        if (!this.IDSeenBy.includes(data.data.userID + "")) {
          this.IDSeenBy.push(data.data.userID);
          this.roomchatService
            .addSeenUsers(this.roomchatID, data.data.userID)
            .subscribe(data => {
              console.log("add_____", data);
            });
        }
        this.confirmation.received = false;
        this.confirmation.sent = false;
        this.confirmation.sending = false;
        this.confirmation.seen = true;
      } else if (
        data.fromComponent === "app" &&
        data.type === "check-valid-seen"
      ) {
        if (data.data.roomchatID !== this.roomchatID) return;
        let isSentByOther;
        if (this.messages.length !== 0) {
          isSentByOther =
            this.messages[this.messages.length - 1].userID + "" !==
            this.myID + "";
        } else {
          isSentByOther = false;
        }
        if (isSentByOther) {
          this.componentCommunicationService.setData({
            fromComponent: "conversation",
            toComponent: "app",
            type: "is-valid-seen",
            roomchatID: data.data.roomchatID,
            userID: data.data.userID
          });
        }
      } else if (
        data.fromComponent === "message" &&
        data.type === "delete-one-message"
      ) {
        let deletedMessageID = data.messageID;
        console.log("deref%%%: ", deletedMessageID);
        for (let i = 0; i < this.messages.length; i++) {
          if (this.messages[i]._id === deletedMessageID) {
            this.messages.splice(i, 1);
            break;
          }
        }
      } else if (data.fromComponent === 'app' && data.type === 'close-wait-call-modal') {
        this.showWaitForCallModal = false;
      }
    });

    // this.socketService.receiveMessage(data => {
    //   console.log('data receive: ', data)
    //   if (!data) return;
    //   if (data.type === 'confirm') {
    //     this.confirmation.sent = true;
    //     this.confirmation.sending = false;
    //   } else if (data.type === 'message') {
    //     this.messages.push({
    //       userID: data.fromUserID,
    //       _id: data.messageID,
    //       content: data.contentText,
    //       attach: data.contentFile,
    //       profileImage: data.profileImage,
    //       time: data.time
    //     })
    //     let scrollElement = document.getElementById('conversation-body');
    //     this.cdR.detectChanges();
    //     scrollElement.scrollTop = scrollElement.scrollHeight;
    //   }
    // });

    // this.socketService.receiveTimestamp().subscribe(data => {
    //   if (!data) return;
    //   this.timeActive = data.time;
    this.receiveTimestampInterval = setInterval(() => {
      if (Math.abs(this.timeActive - Date.now()) < 5000 && !this.isIdle) {
        this.isActive = true;
        this.isIdle = false;
      } else if (Math.abs(this.timeActive - Date.now()) >= 5000) {
        this.isActive = false;
        this.isIdle = false;
      }
    }, 2000);
    console.log("run!!");
  }

  ngAfterViewInit() { }

  ngOnDestroy(): void {
    clearInterval(this.receiveTimestampInterval);
    this.a.unsubscribe();
    if (this.b) {
      this.b.unsubscribe();
    }
    if (this.c) {
      this.c.unsubscribe();
    }

    this.d.unsubscribe();
    if (this.e) {
      this.e.unsubscribe();
    }
    if (this.listenToStopTypingInterval) {
      clearInterval(this.listenToStopTypingInterval);
    }
    // this.f.unsubscribe();
  }

  confirmInit() {
    this.componentCommunicationService.setData({
      fromComponent: "conversation",
      type: "confirm-init"
    });
  }

  confirmLoadParams(roomchatID) {
    this.componentCommunicationService.setData({
      fromComponent: "conversation",
      type: "confirm-loadparams",
      roomchatID: roomchatID
    });
  }

  getParams() {
    let url = this.router.routerState.snapshot.url;
    let tempLength = url.split("/").length;
    return url.split("/")[tempLength - 1] + "";
  }

  processRoomchatName(firstUser, numberOfUsers, typeRoomchat) {
    if (typeRoomchat === "private") {
      return firstUser;
    } else if (typeRoomchat === "group") {
      return firstUser + " và " + numberOfUsers + " người khác";
    }
  }

  onClickPreviousNav() {
    return this.router.navigate(["roomchats"]);
  }

  seeWhoSeen() {
    this.showSeenModal = true;
    this.getUserSubscription = this.userService
      .getUsersFromIDs(this.IDSeenBy)
      .subscribe(data => {
        console.log("runnn", data);
        if (data && data.success) {
          this.infoSeenBy = data.users;
          console.log("info: ", this.infoSeenBy);
        }
      });
    this.cdR.detectChanges();
  }

  closeSeenModal($event) {
    if ($event && $event.target.id === "sent-confirmation") return;
    this.showSeenModal = false;
  }

  showOrHideInfo() {
    this.showConversationInfo = !this.showConversationInfo;
    let w = window.innerWidth;
    let infoConvWidth;
    let hideInputComp = false;
    if (w < 900) {
      infoConvWidth = document.getElementById("conversation-header")
        .clientWidth;
      document.getElementById("info-conversation-component").style.width =
        infoConvWidth + "px";
    } else {
      infoConvWidth = 351;
      document.getElementById("info-conversation-component").style.width =
        infoConvWidth + "px";
    }
    if (this.showConversationInfo) {
      let conversationSideWidth =
        document.getElementById("conversation-header").clientWidth -
        infoConvWidth;
      if (w < 900) {
        hideInputComp = true;
      }
      document.getElementById("conversation-side").style.width =
        conversationSideWidth + "px";
    } else {
      let conversationSideWidth = document.getElementById("conversation-header")
        .clientWidth;
      document.getElementById("conversation-side").style.width =
        conversationSideWidth + "px";
    }
    this.componentCommunicationService.setData({
      fromComponent: "conversation",
      toComponent: "input",
      type: "adjust-input-comp-width",
      conversationSideWidth:
        document.getElementById("conversation-side").clientWidth + "px",
      hide: hideInputComp
    });
  }

  openCallWindow() {
    if (this.usersInRoomchat.length > 2) return;
    this.showWaitForCallModal = true;
    this.componentCommunicationService.setData({
      fromComponent: "conversation",
      type: "call-video",
      roomchatID: this.roomchatID,
      usersInRoomchat: this.usersInRoomchat.filter(el => el !== this.myID)
    });
  }

  listenToStopTyping() {
    return setInterval(() => {
      if (Math.abs(this.confirmation.timeConfirm - Date.now()) > 3000) {
        this.confirmation.typing = false;
      }
    }, 1000);
  }

  adjustHTMLResponsive(w) {
    if (w < 900) {
      this.showConversationInfo = false;
      this.showNavPrevious = true;
      let conversationSideWidth = document.getElementById("conversation-header")
        .clientWidth;
      document.getElementById("conversation-side").style.width =
        conversationSideWidth + "px";
      document.getElementById("loading-messages").style.width =
        conversationSideWidth + "px";
      let conversationUsernameWidth = conversationSideWidth - 150;
      document.getElementById("conversation-header-username").style.width =
        conversationUsernameWidth + "px";
      document.getElementById("input-component").style.width =
        document.getElementById("conversation-side").clientWidth + "px";
      let inputFile = document.getElementById("input-file").clientWidth;
      let inputComponent = document.getElementById("input-component").clientWidth;
      let off = inputComponent;
      document.getElementById("input-text").style.width = off + "px";
      //chinh height
      let conversationHeight = window.innerHeight - 230;
      console.log('check height:____',conversationHeight)
      document
        .getElementById("conversation-body")
        .setAttribute("style", "height: " + conversationHeight + "px");
    } else {
      this.showConversationInfo = true;
      this.showNavPrevious = false;
      let conversationSideWidth =
        document.getElementById("conversation-header").clientWidth - 351;
      document.getElementById("conversation-side").style.width =
        conversationSideWidth + "px";
      document.getElementById("loading-messages").style.width =
        conversationSideWidth + "px";
      let conversationUsernameWidth =
        document.getElementById("conversation-header").clientWidth - 110;
      document.getElementById("conversation-header-username").style.width =
        conversationUsernameWidth + "px";
      document.getElementById("input-component").style.width =
        document.getElementById("conversation-side").clientWidth + "px";
      let inputFile = document.getElementById("input-file").clientWidth;
      let inputComponent = document.getElementById("input-component").clientWidth;
      let off = inputComponent - inputFile - 20;
      document.getElementById("input-text").style.width = off + "px";
      let conversationHeight = window.innerHeight - 190;
      document
        .getElementById("conversation-body")
        .setAttribute("style", "height: " + conversationHeight + "px");
    }
    //Chinh header username
    // let conversationHeight = window.innerHeight - 190;
    // document
    //   .getElementById("conversation-body")
    //   .setAttribute("style", "height: " + conversationHeight + "px");

    // document.getElementById("input-component").style.width =
    //   document.getElementById("conversation-side").clientWidth + "px";
    // let inputFile = document.getElementById("input-file").clientWidth;
    // let inputComponent = document.getElementById("input-component").clientWidth;
    // let off = inputComponent - inputFile - 20;
    // document.getElementById("input-text").style.width = off + "px";

    //chinh info conversation
    let conversationSideHeight = document.getElementById("conversation-side")
      .clientHeight;
    console.log("fggg: ", conversationSideHeight);
    document.getElementById("info-conversation-component").style.height =
      conversationSideHeight + "px";
    let infoConversationBodyHeight = conversationSideHeight - 70;
    document.getElementById("info-conversation-body").style.height =
      infoConversationBodyHeight + "px";
  }

  onScrollMessages() {
    let scrollTop = document.getElementById("conversation-body").scrollTop;
    let scrollHeight = document.getElementById("conversation-body")
      .scrollHeight;
    let clientHeight = document.getElementById("conversation-body")
      .clientHeight;
    if (scrollTop < 10 && this.continueToLoad) {
      console.log("load new messages");
      this.continueToLoad = false;
      this.loadingMessages = true;
      this.cdR.detectChanges();
      let conversationSideWidth =
        document.getElementById("conversation-header").clientWidth - 351;
      document.getElementById("loading-messages").style.width =
        conversationSideWidth + "px";
      this.c = this.messageService
        .getMessages(this.roomchatID, this.previousTimeSeq, 4)
        .subscribe(data => {
          if (data.success) {
            this.loadingMessages = false;
            this.continueToLoad = true;
            let messagesLength = data.messages.length;
            if (messagesLength === 0) {
              this.continueToLoad = false;
              return;
            }

            for (let i = messagesLength - 1; i >= 0; i--) {
              let previousMessageID = this.messages[0].userID;
              let message = data.messages[i];
              this.messages.unshift({
                userID: message.userProfile._id,
                username: message.userProfile.username,
                _id: message.message._id,
                content: message.message.content,
                attach: message.message.attach,
                fileName: message.message.fileName,
                fileType: message.message.fileType,
                profileImage: message.userProfile.profileImage.lowQuality,
                time: message.message.time,
                displayLastInfo: false
              });
              if (previousMessageID !== message.userProfile._id) {
                this.messages[0].displayLastInfo = true;
              }
            }
            this.previousTimeSeq = this.messages[0].time;
          }
        });
    }
  }
}
