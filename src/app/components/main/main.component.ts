import {Component, OnInit, ViewChild} from '@angular/core';
import {CurrentUserService} from "../../services/current-user.service";
import {Router} from "@angular/router";
import {ComponentType} from "../../model/component-type";
import {ContactRequest} from "../../model/contact-request/contact-request";
import {ChatComponent} from "./chat/chat/chat.component";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit{

  isLoggedIn: boolean = false;
  userLetter: string = "";

  currentChatUsername: string = '';
  contactRequests: ContactRequest[] = [];

  componentType: ComponentType = ComponentType.HOME;
  protected readonly ComponentType = ComponentType;

  @ViewChild(ChatComponent)
  chatComponent!: ChatComponent;

  constructor(private currentUserService: CurrentUserService, private router: Router, private toastr: ToastrService) {
  }

  ngOnInit(): void {
    this.currentUserService.isLoggedIn.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
    });
  }

  setHomeComponent() {
    this.componentType = ComponentType.HOME;
    this.currentChatUsername = '';
  }

  setChatComponent(username: string) {
    this.componentType = ComponentType.CHAT;
    this.currentChatUsername = username;
  }

  setVideoComponent() {
    this.componentType = ComponentType.VIDEO;
  }

  getUserLetter(){
    this.userLetter = this.currentUserService.getFirstUserLetter();
  }

  getUserRequests() {
    //TODO
  }

  noRequestsInfo(){
    this.toastr.info("You don't have any requests.");
  }

  logout() {
    this.currentUserService.logout();
  }

}
