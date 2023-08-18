import {Component, OnInit, ViewChild} from '@angular/core';
import {CurrentUserService} from "../../services/current-user.service";
import {Router} from "@angular/router";
import {ComponentType} from "../../model/component-type";
import {ContactRequest} from "../../model/contact-request/contact-request";
import {ToastComponent} from "../utils/toast/toast.component";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit{

  isLoggedIn: boolean = false;
  userLetter: string = "";

  contactRequests: ContactRequest[] = [];

  componentType: ComponentType = ComponentType.HOME;

  @ViewChild(ToastComponent)
  toastComponent!: ToastComponent;

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

  getUserRequests() {

  }

  noRequestsInfo(){
    this.toastComponent.showToast("You don't have any requests.");
  }

  logout() {
    this.currentUserService.logout();
  }

  protected readonly ComponentType = ComponentType;
}
