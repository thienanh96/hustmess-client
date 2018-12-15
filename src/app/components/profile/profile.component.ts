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
  constructor(private userService: UserService) { }

  ngOnInit() {
    this.loadProfile();
  }

  async loadProfile(){
    var data = await this.userService.getMe("low").toPromise();
    this.username = data.user.username;
    this.phoneNumber = data.user.phoneNumber;
    this.email = data.user.email;
    this.avtSrc = data.user.profileImage.lowQuality;
  }
}
