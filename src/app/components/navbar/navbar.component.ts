import { Component, OnInit } from '@angular/core';
import { ComponentCommunicationService } from '../../services/component-communication.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  showNavbarComp: boolean = true;
  constructor(private componentCommunicationService: ComponentCommunicationService) { }

  ngOnInit() {
    this.componentCommunicationService.getData().subscribe(data => {
      if(data && data.fromComponent === 'answer' && data.type === 'hide-navbar'){
        this.showNavbarComp = false;
      }
    })
  }

}
