import {Component, OnInit} from '@angular/core';
import {CurrentUserService} from "../../../services/current-user.service";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  username: string = '';


  constructor(private currentUserService: CurrentUserService) {
  }

  ngOnInit(): void {
    this.username = this.currentUserService.getUsername();
  }

}
