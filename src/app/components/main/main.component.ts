import {Component, OnInit} from '@angular/core';
import {CurrentUserService} from "../../services/current-user.service";
import {Router} from "@angular/router";
import {ComponentType} from "../../model/component-type";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit{

  isLoggedIn: boolean = false;
  userLetter: string = "";

  componentType: ComponentType = ComponentType.HOME;

  constructor(private currentUserService: CurrentUserService, private router: Router) {
  }

  ngOnInit(): void {
    this.currentUserService.isLoggedIn.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
    });
  }

  getUserLetter(){
    this.userLetter = this.currentUserService.getFirstUserLetter();
  }

  logout() {
    this.currentUserService.logout();
  }

  protected readonly ComponentType = ComponentType;
}
