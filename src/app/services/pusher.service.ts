import {Injectable, OnDestroy} from '@angular/core';
import Pusher, {Channel} from "pusher-js";
import {environment} from "../../environments/environment";
import {HttpHeaders} from "@angular/common/http";
import {CurrentUserService} from "./current-user.service";
import {User} from "../model/user/user";
import {ExceptionMessages} from "../model/exception-messages";
import {BehaviorSubject} from "rxjs";
import {ToastrService} from "ngx-toastr";
import {RtcService} from "./rtc.service";

@Injectable({
  providedIn: 'root'
})
export class PusherService implements OnDestroy{

  private pusher: any;
  presenceChannel: any;
  private channels: number[] = [];

  private subscribedBehavior = new BehaviorSubject(false);
  isSubscribed = this.subscribedBehavior.asObservable();

  private onlineBehavior: BehaviorSubject<any> = new BehaviorSubject(null);
  onlineContact = this.onlineBehavior.asObservable();

  private offlineBehavior: BehaviorSubject<any> = new BehaviorSubject(null);
  offlineContact = this.offlineBehavior.asObservable();

  private acceptedRequestBehavior: BehaviorSubject<any> = new BehaviorSubject(null);
  acceptedRequest = this.acceptedRequestBehavior.asObservable();

  private incomingCallBehavior: BehaviorSubject<any> = new BehaviorSubject(null);
  incomingCall = this.incomingCallBehavior.asObservable();

  private answerBehavior: BehaviorSubject<any> = new BehaviorSubject(null);
  answer = this.answerBehavior.asObservable();

  private candidateBehavior: BehaviorSubject<any> = new BehaviorSubject(null);
  candidate = this.candidateBehavior.asObservable();

  private rejectedCallBehavior: BehaviorSubject<any> = new BehaviorSubject(null);
  rejectedCall = this.rejectedCallBehavior.asObservable();

  private hangUpBehavior: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  hangUp = this.hangUpBehavior.asObservable();

  private headers = new HttpHeaders({
    'Authorization': 'Bearer ' + sessionStorage.getItem("jwt")
  });

  constructor(private currentUserService: CurrentUserService, private toastr: ToastrService, private rtcService: RtcService) {
    this.currentUserService.isLoggedIn.subscribe((loggedIn) => {
      if(loggedIn){
        this.headers = new HttpHeaders({
          'Authorization': 'Bearer ' + sessionStorage.getItem("jwt")
        });
      }
    });

    this.initPusher();
  }

  initPusher() {
    this.pusher = new Pusher(environment.pusher.key, {
      cluster: environment.pusher.cluster,
      authEndpoint: environment.pusher.authUrl,
      auth: {
        headers: {
          Authorization: this.headers.get('Authorization')
        },
        params: {
          userId: this.currentUserService.getUserId(),
          username: this.currentUserService.getUsername()
        }
      }
    });
  }

  subscribeToPresenceChannel(contactId: number): Channel {
    return this.pusher.subscribe('presence-' + contactId);
  }

  initChannelList(contacts: User[]) {
    for(let contact of contacts) {
      this.channels.push(contact.userId);
    }
  }

  addChannel(contactId: number) {
    this.channels.push(contactId);
  }

  subscribeToChannels() {
    this.presenceChannel = this.subscribeToPresenceChannel(this.currentUserService.getUserId());
    this.subscribeToContactChannels();

    this.bindChannel();
  }

  private async subscribeToContactChannels() {
    for(let contactId of this.channels) {
      this.subscribeToPresenceChannel(contactId);
    }
  }

  private bindChannel() {
    this.presenceChannel.bind("pusher:subscription_succeeded", () => {
      console.log("Subscribed to channel.");
      this.subscribedBehavior.next(true);
    });

    this.presenceChannel.bind("pusher:subscription_error", (error: any) => {
      this.toastr.error(ExceptionMessages.PUSHER_SOCKET_ERROR);
    });

    this.presenceChannel.bind('pusher:member_added', (data: any) => {
      this.onlineBehavior.next(data.info.username);
    });

    this.presenceChannel.bind('pusher:member_removed', (data: any) => {
      this.offlineBehavior.next(data.info.username);
    });

    this.presenceChannel.bind('accepted_request', (data: any) => {
      this.acceptedRequestBehavior.next(data);
    });

    this.presenceChannel.bind('offer', (message: any) => {
      if(this.rtcService.isActiveCall()) {
        return;
      }
      this.incomingCallBehavior.next(message);
    });

    this.presenceChannel.bind('answer', (message: any) => {
      if(message.usernameFrom === this.rtcService.getContactUsername()) {
        this.answerBehavior.next(message);
      }
    });

    this.presenceChannel.bind('reject', (message: any) => {
      this.rejectedCallBehavior.next(true);
    });

    this.presenceChannel.bind('candidate', (message: any) => {
      this.rtcService.addCandidate(message);
      this.candidateBehavior.next(message);
    });

    this.presenceChannel.bind('hang_up', (message: any) => {
      this.hangUpBehavior.next(true);
    });
  }

  private disconnect() {
    this.pusher.disconnect();
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
