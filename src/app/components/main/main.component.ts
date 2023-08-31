import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CurrentUserService} from "../../services/current-user.service";
import {Router} from "@angular/router";
import {ContactRequest} from "../../model/contact-request/contact-request";
import {ToastrService} from "ngx-toastr";
import {Subject, Subscription, switchMap, takeUntil, timer} from "rxjs";
import {ContactRequestService} from "../../services/contact-request.service";
import {ContactRequestsComponent} from "./contact-requests/contact-requests.component";
import {RtcService} from "../../services/rtc.service";
import {IncomingCallComponent} from "./incoming-call/incoming-call.component";
import {PusherService} from "../../services/pusher.service";
import {ChatComponent} from "./video-chat/chat/chat.component";

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

  @ViewChild(ChatComponent)
  chatComponent!: ChatComponent;

  @ViewChild(IncomingCallComponent)
  incomingCallComponent!: IncomingCallComponent

  @ViewChild(ContactRequestsComponent)
  contactRequestsComponent!: ContactRequestsComponent;

  private componentDestroyed = new Subject<void>();

  constructor(private currentUserService: CurrentUserService, private contactRequestService: ContactRequestService,
              private router: Router, private toastr: ToastrService, private rtcService: RtcService,
              private pusherService: PusherService, private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.currentUserService.isLoggedIn.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
    });

    this.pusherService.subscribeToChannels();
    this.getUserRequests();
  }

  ngAfterViewInit(): void {
    this.initHandlers();
  }

  initHandlers() {
    this.pusherService.incomingCall
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe((message) => {
        if(message) {
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
    this.pusherService.disconnect();
    this.currentUserService.logout();
  }

  ngOnDestroy(): void {
    if(this.requestsSubscription) {
      this.requestsSubscription.unsubscribe();
    }

    this.pusherService.resetContactRequestBehavior();

    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }

}
