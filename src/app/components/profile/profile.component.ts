import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  username : String;
  phoneNumber: String;
  email : String;
  avtSrc : String;
  class : String;
  grade : String;
  mssv: String;
  showModifyUserProfile: boolean = false;
  constructor(private userService: UserService) { }

  ngOnInit() {
    this.loadProfile();
  }

  async loadProfile(){
    var data = await this.userService.getMe("low").toPromise();
    if((!data) || !data.success){
      return alert('Error happenned! Load fail')
    }
    this.username = data.user.username;
    this.phoneNumber = data.user.phoneNumber;
    this.email = data.user.email;
    this.avtSrc = data.user.profileImage.lowQuality;
    this.class = data.user.detail.class || '';
    this.grade = data.user.detail.grade || '';
    this.mssv = data.user.detail.mssv || '';
  }

  openModifyUserProfileModal(){
    return this.showModifyUserProfile = true
  }

  closeModifyUserProfileModal(){
    return this.showModifyUserProfile = false;
  }

  updateProfile(){
    return this.userService.updateUserProfile({
      username: this.username,
      phoneNumber: this.phoneNumber,
      "detail.mssv": this.mssv,
      "detail.grade": this.grade,
      "detail.class": this.class
    }).subscribe(data => {
      if(data && data.success){
        alert('Update profile successfully!')
      }
      this.closeModifyUserProfileModal();
    })
  }


}
