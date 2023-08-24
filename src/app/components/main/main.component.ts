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
import {RtcService} from "../../services/rtc.service";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit, OnDestroy {

  isLoggedIn: boolean = false;

  contactRequests: ContactRequest[] = [];
  requestsSubscription!: Subscription;

  componentType: ComponentType = ComponentType.HOME;
  readonly ComponentType = ComponentType;

  @ViewChild(ChatComponent)
  chatComponent!: ChatComponent;

  @ViewChild(CallComponent)
  callComponent!: CallComponent;
  private videoCall: boolean = false;

  @ViewChild(ContactRequestsComponent)
  contactRequestsComponent!: ContactRequestsComponent;

  navCol: string = '2';
  mainCol: string = '10';

  constructor(private currentUserService: CurrentUserService, private contactRequestService: ContactRequestService, private router: Router, private toastr: ToastrService, private rtcService: RtcService) {
  }

  ngOnInit(): void {
    this.currentUserService.isLoggedIn.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
    });

    this.getUserRequests();
  }

  setHomeComponent() {
    this.resetColumns();
    this.componentType = ComponentType.HOME;
    this.rtcService.setContactUsername('');
  }

  setChatComponent(username: string) {
    this.resetColumns();
    this.componentType = ComponentType.CHAT;
    this.rtcService.setContactUsername(username);
  }

  setCallComponent(videoCall: boolean, isCaller: boolean) {
    this.setColumnsCall();
    this.rtcService.setCallerStatus(isCaller);
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

  private setColumnsCall() {
    this.navCol = '1';
    this.mainCol = '11';
  }

  private resetColumns() {
    this.navCol = '2';
    this.mainCol = '10';
  }

}
