import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
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
import {IncomingCallComponent} from "./incoming-call/incoming-call.component";
import {PusherService} from "../../services/pusher.service";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit, OnDestroy, AfterViewInit {

  isLoggedIn: boolean = false;

  contactRequests: ContactRequest[] = [];
  requestsSubscription!: Subscription;

  componentType: string = 'HOME';
  readonly ComponentType = ComponentType;

  @ViewChild(ChatComponent)
  chatComponent!: ChatComponent;

  @ViewChild(IncomingCallComponent)
  incomingCallComponent!: IncomingCallComponent

  @ViewChild(ContactRequestsComponent)
  contactRequestsComponent!: ContactRequestsComponent;

  hideSidenav: boolean = false;

  constructor(private currentUserService: CurrentUserService, private contactRequestService: ContactRequestService,
              private router: Router, private toastr: ToastrService, private rtcService: RtcService,
              private pusherService: PusherService, private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.currentUserService.isLoggedIn.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
    });

    this.getUserRequests();
  }

  ngAfterViewInit(): void {
    this.initHandlers();
  }

  initHandlers() {
    this.pusherService.incomingCall.subscribe((message) => {
      if(message) {
        console.log("STIGAO CALL ", message)
        this.incomingCallComponent.open(message);
        this.pusherService.handleIncomingCall();
      }
    });
  }

  setHomeComponent() {
    this.componentType = 'HOME'
    this.rtcService.setContactUsername('');
  }

  setChatComponent(username: string) {
    this.componentType = 'CHAT';
    this.rtcService.setContactUsername(username);
  }

  setCallComponent(videoCall: boolean, isCaller: boolean) {
    this.rtcService.setCallerStatus(isCaller);
    this.rtcService.setVideoCall(videoCall);
    this.router.navigate(['call']);
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
    //todo delete
    this.hideSidenav = true;
    this.cdr.detectChanges();
  }

  private resetColumns() {
    //todo delete
    this.hideSidenav = false;
    this.cdr.detectChanges();
  }

}
