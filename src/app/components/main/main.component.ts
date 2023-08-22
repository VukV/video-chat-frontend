import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CurrentUserService} from "../../services/current-user.service";
import {Router} from "@angular/router";
import {ComponentType} from "../../model/component-type";
import {ContactRequest} from "../../model/contact-request/contact-request";
import {ChatComponent} from "./chat/chat/chat.component";
import {ToastrService} from "ngx-toastr";
import {interval, retry, Subscription, switchMap, timer} from "rxjs";
import {ContactRequestService} from "../../services/contact-request.service";
import {ContactRequestsComponent} from "./contact-requests/contact-requests.component";
import {CallComponent} from "./chat/call/call.component";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit, OnDestroy {

  isLoggedIn: boolean = false;

  currentChatUsername: string = '';
  contactRequests: ContactRequest[] = [];
  requestsSubscription!: Subscription;

  componentType: ComponentType = ComponentType.HOME;
  protected readonly ComponentType = ComponentType;

  @ViewChild(ChatComponent)
  chatComponent!: ChatComponent;

  @ViewChild(CallComponent)
  callComponent!: CallComponent;
  private videoCall: boolean = false;

  @ViewChild(ContactRequestsComponent)
  contactRequestsComponent!: ContactRequestsComponent;

  constructor(private currentUserService: CurrentUserService, private contactRequestService: ContactRequestService, private router: Router, private toastr: ToastrService) {
  }

  ngOnInit(): void {
    this.currentUserService.isLoggedIn.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
    });

    this.getUserRequests();
  }

  setHomeComponent() {
    this.componentType = ComponentType.HOME;
    this.currentChatUsername = '';
  }

  setChatComponent(username: string) {
    this.componentType = ComponentType.CHAT;
    this.currentChatUsername = username;
  }

  setCallComponent(videoCall: boolean) {
    this.componentType = ComponentType.CALL;
    this.videoCall = videoCall;
  }

  isVideoCall() {
    return this.videoCall;
  }

  getUserRequests() {
    this.requestsSubscription = timer(0, 2 * 60 * 1000)
      .pipe(
        switchMap(() => this.contactRequestService.getMyRequests())
      ).subscribe({
        complete: () => {

        },
        error: (error) => {
          this.toastr.error(error.message)
        },
        next: (requests) => {
          this.contactRequests = requests;
        }
      });
  }

  openContactRequests() {
    this.contactRequestsComponent.open(this.contactRequests);
  }

  noRequestsInfo(){
    this.toastr.info("You don't have any requests.");
  }

  logout() {
    this.currentUserService.logout();
  }

  ngOnDestroy(): void {
    if(this.requestsSubscription) {
      this.requestsSubscription.unsubscribe();
    }
  }

}
