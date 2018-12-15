import {
  Component,
  OnInit,
  HostListener,
  ChangeDetectorRef
} from "@angular/core";
import { Router, ActivatedRoute, RouterStateSnapshot } from "@angular/router";
import { Subscription } from "rxjs";
import { RoomchatService } from "../../services/roomchat.service";
import { RoomchatUserService } from "../../services/roomchat-user.service";
import { UserService } from "../../services/user.service";
import { UploadService } from "../../services/upload.service";
import { SocketService } from "../../services/socket.service";
import { ComponentCommunicationService } from "../../services/component-communication.service";

@Component({
  selector: "app-info-conversation",
  templateUrl: "./info-conversation.component.html",
  styleUrls: ["./info-conversation.component.css"]
})
export class InfoConversationComponent implements OnInit {
  roomchatID: string = "";
  roomchatName: string = "";
  profileImage: string = "";
  usersInRoomchat: Array<any> = [];
  myID: string = "";
  pickedUserID: string = "";
  showAddUserToGroup: boolean = false;
  showManageUserGroup: boolean = false;
  images = [];
  files = [];
  searchTerm: string = "";
  searchedList = [];
  pickedUsersToAdd = [];
  getRoomchatSubscription: Subscription;
  getUsersInRoomchatSubscription: Subscription;
  addUsersToRoomchatSubscription: Subscription;
  getRoleUserInRoomchatSubscription: Subscription;
  continueToLoad: boolean = true;
  previousTimeSeq: number = 0;
  loadingPhotos: boolean = false;
  currentPhotoInViewMode: string = "";
  currentPhotoIndexInViewMode: number = 0;
  openViewMode: boolean = false;
  getPhotoViewModeSubscription: Subscription;
  receiveNotification: boolean = false;
  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.adjustHTML();
  }
  constructor(
    private router: Router,
    private roomchatService: RoomchatService,
    private roomchatUserService: RoomchatUserService,
    private userService: UserService,
    private cdRef: ChangeDetectorRef,
    private socketService: SocketService,
    private componentCommunicationService: ComponentCommunicationService,
    private uploadService: UploadService
  ) {}

  ngOnInit() {
    this.roomchatID = this.getParams();
    this.getRoomchatSubscription = this.roomchatService
      .getRoomchat(this.roomchatID)
      .subscribe(data => {
        if (data && data.success) {
          this.profileImage =
            data.roomchat.firstUserInRoomchat.profileImage.lowQuality;
          this.roomchatName = this.processRoomchatName(
            data.roomchat.firstUserInRoomchat.username,
            data.roomchat.numberOfUserInRoomchat - 1,
            data.roomchat.typeRoomchat
          );
          this.myID = data.myID;
        }
      });
    this.getRoomchatSubscription = this.getUsersInRoomchat();
    this.previousTimeSeq = Date.now() + 100000;
    this.loadingPhotos = true;
    this.uploadService
      .getFiles(this.roomchatID, "image", this.previousTimeSeq, 10)
      .subscribe(data => {
        if (data && data.success) {
          this.loadingPhotos = false;
          this.images = data.files;
          console.log("image array: ", this.images);
          let filesLength = this.images.length;
          if (filesLength === 0) return;

          this.previousTimeSeq = this.images[filesLength - 1].time;
        }
      });
    this.uploadService
      .getFiles(this.roomchatID, "application", 0, 0)
      .subscribe(data => {
        if (data && data.success) {
          this.files = data.files;
        }
      });
    this.componentCommunicationService.getData().subscribe(data => {
      if (
        data &&
        data.fromComponent === "app" &&
        data.type === "add-users-to-roomchat"
      ) {
        if (this.roomchatID !== data.roomchatID) return;
        this.usersInRoomchat = [];
        this.getRoomchatSubscription = this.getUsersInRoomchat();
      }
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

  assignAdmin() {
    this.roomchatUserService
      .assignAdmin(this.roomchatID, this.pickedUserID)
      .subscribe(data => {
        if (data && data.success) {
          for (let user of this.usersInRoomchat) {
            if (user._id === this.pickedUserID) {
              user.isAdmin = true;
              this.showManageUserGroup = false;
              break;
            }
          }
        }else {
          return alert('Error when assigning admin! Maybe you are not permitted')
        }
      });
  }

  deleteAssignAdmin() {
    this.roomchatUserService
      .deleteAssignAdmin(this.roomchatID, this.pickedUserID)
      .subscribe(data => {
        if (data && data.success) {
          for (let user of this.usersInRoomchat) {
            if (user._id === this.pickedUserID) {
              user.isAdmin = false;
              this.showManageUserGroup = false;
              break;
            }
          }
        } else {
          return alert('Error when removing assigning admin! Maybe you are not permitted')
        }
      });
  }

  deleteUserFromGroup() {
    return this.roomchatUserService
      .deleteUserFromRoomchat(this.roomchatID, this.pickedUserID)
      .subscribe(data => {
        if (data && data.success) {
          this.usersInRoomchat = [];
          this.getUsersInRoomchat();
          this.socketService.emitDeleteUsersFromGroup(
            this.roomchatID,
            this.pickedUserID
          );
          this.closeManageUserGroupModal();
          return alert("Delete user in roomchat successfully!");
        } else {
          this.closeManageUserGroupModal();
          return alert("Error occurred when deleting!");
        }
      });
  }

  closeManageUserGroupModal() {
    this.showManageUserGroup = false;
    this.pickedUserID = "";
  }

  openManageUserGroupModal(userID: string) {
    this.showManageUserGroup = true;
    this.pickedUserID = userID;
    console.log("picked user: ", userID);
    this.cdRef.detectChanges();
    let w = window.innerWidth;
    if (w < 900) {
      document.getElementById(
        "custom-modal-content-manage-user-in-group"
      ).style.width = "100%";
    } else {
      document.getElementById(
        "custom-modal-content-manage-user-in-group"
      ).style.width = "35%";
    }
  }

  adjustHTML() {
    let conversationSideHeight = document.getElementById("conversation-side")
      .clientHeight;
    console.log("fggg: ", conversationSideHeight);
    document.getElementById("info-conversation-component").style.height =
      conversationSideHeight + "px";
    let infoConversationBodyHeight = conversationSideHeight - 70;
    document.getElementById("info-conversation-body").style.height =
      infoConversationBodyHeight + "px";
  }

  onSearchUser() {
    this.userService.searchUsers(this.searchTerm, "friend").subscribe(data => {
      if (data && data.success) {
        this.searchedList = data.users;
      }
    });
  }

  onClickAddUsers() {
    this.showAddUserToGroup = true;
    this.cdRef.detectChanges();
    let w = window.innerWidth;
    if (w < 900) {
      document.getElementById(
        "custom-modal-content-add-user-to-group"
      ).style.width = "100%";
    } else {
      document.getElementById(
        "custom-modal-content-add-user-to-group"
      ).style.width = "35%";
    }
  }

  addUsersToGroup() {
    let userIDs = this.pickedUsersToAdd.map(el => el._id);
    this.getUsersIDInRoomchat(userIDsInRoomchat => {
      userIDs = userIDs.filter(el => !userIDsInRoomchat.includes(el));
      this.addUsersToRoomchatSubscription = this.roomchatUserService
        .addUsersToRoomchat(userIDs, this.roomchatID)
        .subscribe(data => {
          if (data && data.success) {
            this.usersInRoomchat = [];
            this.getUsersInRoomchatSubscription = this.getUsersInRoomchat();
            this.addUsersToRoomchatSubscription.unsubscribe();
            this.closeManageUserGroupModal();
            this.closeAddUsersModal();
            this.socketService.emitAddUsersToGroup(this.roomchatID, userIDs);
            this.showManageUserGroup = false;
          } else {
            return alert('Fail when adding new user to roomchat')
          }
        });
    });
  }

  onClickSearchResult(searchedUser: {}) {
    this.pickedUsersToAdd.push(searchedUser);
    this.searchedList = [];
  }
  closeAddUsersModal() {
    this.searchedList = [];
    this.pickedUsersToAdd = [];
    this.showAddUserToGroup = false;
    if (this.addUsersToRoomchatSubscription) {
      this.addUsersToRoomchatSubscription.unsubscribe();
    }
  }

  onScrollInfoConv() {
    let scrollTop = document.getElementById("info-conversation-body").scrollTop;
    let scrollHeight = document.getElementById("info-conversation-body")
      .scrollHeight;
    let clientHeight = document.getElementById("info-conversation-body")
      .clientHeight;
    this.loadingPhotos = true;
    if (scrollHeight - 10 < clientHeight + scrollTop && this.continueToLoad) {
      this.continueToLoad = false;
      this.cdRef.detectChanges();
      this.uploadService
        .getFiles(this.roomchatID, "image", this.previousTimeSeq, 4)
        .subscribe(data => {
          if (data && data.success) {
            this.loadingPhotos = false;
            this.continueToLoad = true;
            let images = data.files;
            let filesLength = images.length;
            if (filesLength === 0) return;
            this.images = this.images.concat(images);
            this.previousTimeSeq = images[filesLength - 1].time;
            console.log(
              "time-seq: ",
              this.previousTimeSeq,
              images.map(el => el.time)
            );
          }
        });
    }
  }

  getUsersInRoomchat() {
    return this.roomchatUserService
      .getRoomchatUsers(this.roomchatID)
      .subscribe(data => {
        if (data && data.success) {
          let userIDsInRoomchat = data.roomchatUsers.map(el => el.userID);
          let roleUsersInRoomchat = data.roomchatUsers.map(el => el.isAdmin);
          this.userService
            .getUsersFromIDs(userIDsInRoomchat)
            .subscribe(dataa => {
              if (dataa && dataa.success) {
                let index = 0;
                for (let userInRoomchat of dataa.users) {
                  this.usersInRoomchat.push({
                    _id: userInRoomchat._id,
                    username: userInRoomchat.username,
                    profileImage: userInRoomchat.profileImage.lowQuality,
                    isAdmin: roleUsersInRoomchat[index]
                  });
                  index++;
                }
              }
            });
        }
      });
  }

  getUsersIDInRoomchat(cb) {
    return this.roomchatUserService
      .getRoomchatUsers(this.roomchatID)
      .subscribe(data => {
        if (data && data.success) {
          let userIDsInRoomchat = data.roomchatUsers.map(el => el.userID);
          return cb(userIDsInRoomchat);
        } else {
          return cb(null);
        }
      });
  }

  onClickImage(imageID, i) {
    this.openViewMode = true;
    this.currentPhotoIndexInViewMode = i;
    this.cdRef.detectChanges();
    this.showPhotoInViewMode(imageID);
  }

  showPhotoInViewMode(imageID) {
    this.getPhotoViewModeSubscription = this.uploadService
      .getFile(this.roomchatID, "image", imageID)
      .subscribe(data => {
        if (data && data.success) {
          this.currentPhotoInViewMode = data.imageSrc;
          let photoWidth = data.photoInfo.size.width;
          let photoHeight = data.photoInfo.size.height;
          console.log("Siz::: ", photoWidth, photoHeight);
          if (photoHeight >= photoWidth) {
            document.getElementById("image-in-view-mode").style.height = "100%";
            document.getElementById("image-in-view-mode").style.width = "auto";
          } else {
            document.getElementById("image-in-view-mode").style.width = "100%";
            document.getElementById("image-in-view-mode").style.height = "auto";
          }
        }
      });
  }

  openNextPhotoViewMode() {
    if (this.currentPhotoIndexInViewMode < this.images.length - 1) {
      this.currentPhotoIndexInViewMode++;
    }
    let nextPhoto = this.images[this.currentPhotoIndexInViewMode];
    if (nextPhoto) {
      let imageID = nextPhoto.fileID;
      this.showPhotoInViewMode(imageID);
    }
  }

  openPreviousPhotoViewMode() {
    if (this.currentPhotoIndexInViewMode > 0) {
      this.currentPhotoIndexInViewMode--;
    }
    let previousPhoto = this.images[this.currentPhotoIndexInViewMode];
    if (previousPhoto) {
      let imageID = previousPhoto.fileID;
      this.showPhotoInViewMode(imageID);
    }
  }

  closeViewMode() {
    this.getPhotoViewModeSubscription.unsubscribe();
    this.openViewMode = false;
  }

  turnOffNotification() {
    this.receiveNotification = true;
    return this.componentCommunicationService.setData({
      fromComponent: "info-conversation",
      toComponent: "navbar",
      type: "turn-off-notification",
      roomchatID: this.roomchatID
    });
  }

  turnOnNotification() {
    this.receiveNotification = false;
    return this.componentCommunicationService.setData({
      fromComponent: "info-conversation",
      toComponent: "navbar",
      type: "turn-on-notification",
      roomchatID: this.roomchatID
    });
  }
}
