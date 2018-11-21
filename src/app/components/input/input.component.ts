import { Component, OnInit, AfterViewInit, HostListener, ViewChild, ChangeDetectorRef, AfterViewChecked, AfterContentChecked } from '@angular/core';
import { MessageService } from '../../services/message.service';
import { ComponentCommunicationService } from '../../services/component-communication.service';
import { SocketService } from '../../services/socket.service';
import { AuthenticationService } from '../../services/authentication.service';
import { UserService } from '../../services/user.service';
import { UploadService } from '../../services/upload.service';


@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css']
})
export class InputComponent implements OnInit, AfterViewInit, AfterContentChecked {
  roomchatID: string;
  myInfo: any = {
    _id: '',
    profileImage: '',
    username: ''
  }
  contentText: string = '';
  heightTextArea: number = 27;
  widthTextArea: number = 0;
  timeTyping: number = 0;
  previewFiles: Array<any> = [];
  tempPreviewFile: Array<File> = [];
  currentIndexPreviewFile: number = 0;
  showEmojModal: boolean = false;
  emojList = {
    type1: ['😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', '😋', '😎', '😍', '😘'],
    type2: ['👶', '👧', '🧒', '👦', '👩', '🧑', '👨', '👵', '🧓', '👴', '👲', '👳‍', '👳‍', '🧔', '👱‍', '👱‍', '👨‍'],
    type3: ['🧥', '👚', '👕', '👖', '👔', '👗', '👙', '👘', '👠', '👡', '👢', '👞', '👟']
  }
  constructor(private messageService: MessageService,
    private componentCommunicationService: ComponentCommunicationService,
    private socketService: SocketService,
    private authService: AuthenticationService,
    private userService: UserService,
    private uploadService: UploadService,
    private cdR: ChangeDetectorRef) { }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    let inputFile = document.getElementById('input-file').clientWidth;
    let inputComponent = document.getElementById('input-component').clientWidth;
    let off = inputComponent - inputFile - 20
    document.getElementById('input-text').style.width = off + 'px';
  }



  ngOnInit() {
    // document.getElementById('input-component').style.width = document.getElementById('conversation-side').clientWidth + 'px';
    // let inputFile = document.getElementById('input-file').clientWidth;
    // let inputComponent = document.getElementById('input-component').clientWidth;
    // let off = inputComponent - inputFile - 40
    // console.log('offff',off)
    // document.getElementById('input-text').style.width = off + 'px';
    // this.cdR.detectChanges();
    this.componentCommunicationService.getData().subscribe(data => {
      if (!data || data.fromComponent !== 'conversation') return;
      if (data.type === 'adjust-input-comp-width') {
        if (data.hide) {
          document.getElementById('input-component').style.display = 'none'
        } else {
          document.getElementById('input-component').style.display = 'block';
          
          document.getElementById('input-component').style.width = data.conversationSideWidth;
          let inputFile = document.getElementById('input-file').clientWidth;
          let inputComponent = document.getElementById('input-component').clientWidth;
          let off = inputComponent - inputFile - 20;
          document.getElementById('input-text').style.width = off + 'px';
        }

      }
      this.roomchatID = data.roomchatID;
    });
    this.userService.getMe('low').subscribe(data => {
      if (data && data.success) {
        this.myInfo._id = data.user._id;
        this.myInfo.profileImage = data.user.profileImage.lowQuality;
        this.myInfo.username = data.user.username;
      }
    });
  }

  onChangeTextArea() {
    this.timeTyping = Date.now();
    if (this.roomchatID) {
      let onTypingInterval = setInterval(() => {
        if (Math.abs(this.timeTyping - Date.now()) < 3000) {
          this.socketService.emitTyping(this.roomchatID, 'typing');
        } else {
          clearInterval(onTypingInterval);
        }
      }, 100)

    }
    let heightTextArea = document.getElementById('text-area-input').clientHeight;
    let widthTextArea = document.getElementById('input-text').clientWidth;
    if (heightTextArea > 190) {
      let textAreaElement = document.getElementById('text-area-input');
      textAreaElement.style.maxHeight = '230px';
      document.getElementById('text-area-input').style['overflowY'] = 'scroll';
      heightTextArea = document.getElementById('text-area-input').clientHeight;
    } else {
      document.getElementById('text-area-input').style['overflowY'] = 'hidden';
    }

    let offsetHeight = this.heightTextArea - heightTextArea;
    let offsetWidth = Math.abs(this.widthTextArea - widthTextArea);
    if (offsetHeight !== 0 && offsetWidth === 0) {
      let oldHeight = document.getElementById('conversation-body').style.height;
      let newHeight = parseInt(oldHeight) + offsetHeight;
      document.getElementById('conversation-body').style.height = newHeight + 'px';
      // document.getElementById('info-conversation-component').style.height = newHeight + 'px';
      // let conversationSideHeight = document.getElementById('conversation-side').clientHeight;
      // let infoConversationBodyHeight = conversationSideHeight - 70;
      // document.getElementById('info-conversation-body').style.height = infoConversationBodyHeight + 'px';
    }
    this.widthTextArea = document.getElementById('input-text').clientWidth;
    this.heightTextArea = document.getElementById('text-area-input').clientHeight;
  }

  onClick() {
    if (this.roomchatID) {
      this.componentCommunicationService.setData({
        fromComponent: 'input',
        toComponent: 'app',
        type: 'confirm-seen-message',
        roomchatID: this.roomchatID,
        userID: this.myInfo._id
      })
    }

  }

  onEnter($event) {
    if ($event.keyCode === 13) {
      $event.preventDefault();

      let textAreaElement = <HTMLInputElement>document.getElementById('text-area-input');
      this.componentCommunicationService.setData({
        fromComponent: 'input',
        status: 'sending'
      })
      this.sendMessages(textAreaElement);

    } else {
      this.showEmojModal = false;
    }

  }

  ngAfterViewInit() {
    // console.log('side: ::',document.getElementById('conversation-side').clientWidth)
    // document.getElementById('input-component').style.width = document.getElementById('conversation-side').clientWidth + 'px';
    // let inputFile = document.getElementById('input-file').clientWidth;
    // let inputComponent = document.getElementById('input-component').clientWidth;
    // let off = inputComponent - inputFile - 20;
    // document.getElementById('input-text').style.width = off + 'px';
    // this.widthTextArea = document.getElementById('input-text').clientWidth;
    // this.heightTextArea = document.getElementById('text-area-input').clientHeight;
  }

  showPreviewFiles($event) {
    let files = $event.target.files;
    let filesLength = files.length;

    if (this.previewFiles.length === 0) {
      this.componentCommunicationService.setData({
        fromComponent: 'input',
        toComponent: 'conversation',
        type: 'adjust-conversation-body'
      });
      document.getElementById
    }
    for (let i = 0; i < filesLength; i++) {
      let myReader: FileReader = new FileReader();
      let ext = files[i].name.split('.')[files[i].name.split('.').length - 1] + '';
      if (!ext || ext === '') continue;
      let isImage = false;
      if (ext.toLowerCase() + '' === 'png' || ext.toLowerCase() + '' === 'jpeg' || ext.toLowerCase() + '' === 'jpg') {
        isImage = true;
      }
      if (isImage) {
        let imageSrc = undefined;
        // this.tempPreviewFiles.push(files[i]);
        this.tempPreviewFile.push(files[i]);
        myReader.onloadend = (e) => {
          imageSrc = myReader.result;
          this.previewFiles.push({
            file: this.tempPreviewFile[this.currentIndexPreviewFile],
            ext: ext.toUpperCase(),
            imageSrc: imageSrc,
            isImage: isImage,
            idPreviewFile: Date.now(),
            percentUpload: 0
          });
          this.currentIndexPreviewFile++;
          this.cdR.detectChanges();
          document.getElementById('preview-file').style.maxWidth = document.getElementById('input-component').clientWidth + 'px';
        }
        myReader.readAsDataURL(files[i]);

      } else {
        this.previewFiles.push({
          file: files[i],
          ext: ext.toUpperCase(),
          isImage: isImage,
          idPreviewFile: Date.now(),
          percentUpload: 0
        });
      }

    }
    this.cdR.detectChanges();
    let uploadFileEl = <HTMLInputElement>document.getElementById('upload-file');
    let uploadImageEl = <HTMLInputElement>document.getElementById('upload-image');
    uploadFileEl.value = null;
    uploadImageEl.value = null;


  }

  sendMessages(textAreaElement) {
    let contentText = textAreaElement.value;
    let filesLength = this.previewFiles.length;
    if (filesLength === 0 && (contentText !== '' && contentText)) {
      this.messageService.sendMessage(this.roomchatID, contentText, '', '', '').subscribe(data => {
        this.contentText = '';
        this.resizeInputTextArea(textAreaElement);
        this.socketService.sendMessage({
          fromUserID: data.newMessage.fromUserID,
          type: 'message',
          roomchatID: this.roomchatID,
          messageID: data.newMessage._id,
          username: this.myInfo.username,
          time: data.newMessage.time,
          profileImage: data.userInfo.profileImage.lowQuality,
          contentText: data.newMessage.content,
          fileType: '',
          contentFile: '',
          fileName: ''
        })
        this.sendCompCommunicationData(data, contentText, '');
      })
    } else if (filesLength !== 0) {
      for (let filePreview of this.previewFiles) {
        let formData = new FormData();
        formData.append('file', filePreview.file);
        console.log('files: ', filePreview.file)
        let percentUpload;
        let idPreviewFile;
        this.uploadService.uploadFile(formData, filePreview.idPreviewFile, this.roomchatID).subscribe(dataUpload => {
          if (dataUpload.index) {
            percentUpload = dataUpload.percentDone;
            idPreviewFile = dataUpload.index;
            this.previewFiles.filter(el => el.idPreviewFile + '' === idPreviewFile + '')[0].percentUpload = percentUpload;
          }
          if (dataUpload && dataUpload.success) { //upload xong
            let attach = '';
            let dataFile = '';
            if (dataUpload.fileType + '' === 'image') {
              attach = dataUpload.fileName;
              dataFile = dataUpload.imageSource;
              console.log('attach: ', attach)
            } else {
              attach = dataUpload.downloadLink;
              dataFile = dataUpload.downloadLink;
            }
            console.log('datafile: ', dataFile)
            let fileName = dataUpload.originalName
            this.deleteOneFilePreview(idPreviewFile);
            this.messageService.sendMessage(this.roomchatID, contentText, attach, dataUpload.fileType, fileName).subscribe(data => {
              if (data && data.success) {
                console.log('$RRTT: ', data)
                this.contentText = '';
                if (this.previewFiles.length === 0) { //da gui het tat ca cac files
                  this.resizeInputTextArea(textAreaElement);
                }
                this.socketService.sendMessage({
                  fromUserID: data.newMessage.fromUserID,
                  type: 'message',
                  roomchatID: this.roomchatID,
                  messageID: data.newMessage._id,
                  time: data.newMessage.time,
                  profileImage: data.userInfo.profileImage.lowQuality,
                  contentText: data.newMessage.content,
                  contentFile: dataFile,
                  fileType: data.file.fileType,
                  fileName: data.file.originalName
                });
                this.currentIndexPreviewFile = 0;
                this.sendCompCommunicationData(data, contentText, dataFile);

              }

            })
          }

        })
      }
    }




  }

  ngAfterContentChecked() {
  }

  resizeInputTextArea(textAreaElement: HTMLInputElement) {
    textAreaElement.style.height = '29px';
    this.heightTextArea = document.getElementById('text-area-input').clientHeight;
    document.getElementById('text-area-input').style['overflowY'] = 'hidden';
    let conversationHeight = window.innerHeight - 192;
    document.getElementById('conversation-body').setAttribute('style', 'height: ' + conversationHeight + 'px');
  }

  sendCompCommunicationData(data, contentText, dataFile) {
    let fileType;
    let fileName;
    if (data.file === null) {
      console.log('log hre')
      fileType = '';
      fileName = '';
    } else {
      console.log('log hre^^^^^', data)
      fileType = data.file.fileType;
      fileName = data.file.originalName;
    }

    if (this.myInfo._id) {
      this.componentCommunicationService.setData({
        status: 'sent',
        fromComponent: 'input',
        messageID: data.newMessage._id,
        contentText: data.newMessage.content,
        username: this.myInfo.username,
        contentFile: dataFile,
        fileType: fileType,
        fileName: fileName
      });
      this.componentCommunicationService.setData({
        fromComponent: 'input',
        type: 'arrange-roomchat',
        lastUserID: this.myInfo._id,
        content: contentText,
        roomchatID: this.roomchatID,
        profileImage: this.myInfo.profileImage
      })
    }
  }

  emojModalConfig() {
    let emojEl = document.getElementById('emoj-modal');
    let inputComponentEl = document.getElementById('input-component');
    let offsetWidth = inputComponentEl.clientWidth - 5;
    let offsetHeight = inputComponentEl.clientHeight;
    console.log('bottom: ', emojEl.style.bottom)
    emojEl.style.bottom = offsetHeight + 'px';
    emojEl.style.width = offsetWidth + 'px';
  }

  onClickEmojType($event) {
    let idEmojType = $event.target.id + '';
    for (let i = 1; i <= 10; i++) {
      let elType = document.getElementById('emoj-type-' + i);
      if (idEmojType === elType.id + '') {
        let elDetail = document.getElementById('emoj-detail-' + i);
        elDetail.style.display = 'block';
        elType.style.backgroundColor = '#e7e7e7'
        for (let j = 1; j <= 10; j++) {
          let elDetailCheck = document.getElementById('emoj-detail-' + j);
          let elTypeOther = document.getElementById('emoj-type-' + j);
          if (i !== j) {
            elTypeOther.style.backgroundColor = 'white'
            elDetailCheck.style.display = 'none';
          }
        }
      }
    }
  }

  onClickEmoj($event) {
    let emojID = $event.target.id + '';
    let getEmojElement = document.getElementById(emojID);
    let emoj = '';
    if (getEmojElement) {
      emoj = getEmojElement.textContent;
    }
    let textAreaElement = <HTMLInputElement>document.getElementById('text-area-input');
    let newValue = textAreaElement.value + emoj;
    textAreaElement.value = newValue;
  }

  openEmojModal() {
    this.showEmojModal = true;
    this.cdR.detectChanges();
    this.emojModalConfig();
  }

  closeEmojModal($event) {
    console.log('iddd: ', $event.target.id)
    if ($event.target.id + '' !== 'emoj-choose-icon' && $event.target.id + '' !== 'emoj-choose-div') {
      this.showEmojModal = false;
    }
  }

  deleteOneFilePreview(idPreviewFile: Number) {
    if (!idPreviewFile) return;
    for (let i = 0; i < this.previewFiles.length; i++) {
      if (this.previewFiles[i].idPreviewFile + '' === idPreviewFile + '') {
        console.log('deleted: ', i)
        return this.previewFiles.splice(i, 1);
      }
    }
  }


}
