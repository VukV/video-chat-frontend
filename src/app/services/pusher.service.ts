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
  privateChannel: any;
  private channels: number[] = [];
  private bind: boolean = false;

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

  private hangUpBehavior: BehaviorSubject<any> = new BehaviorSubject<any>(false);
  hangUp = this.hangUpBehavior.asObservable();

  private chatBehavior: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  newChatMessage = this.chatBehavior.asObservable();

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

  subscribeToPrivateChannel() {
    return this.pusher.subscribe('private-' + this.currentUserService.getUserId());
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
    if(!this.presenceChannel) {
      this.presenceChannel = this.subscribeToPresenceChannel(this.currentUserService.getUserId());
      this.subscribeToContactChannels();
    }

    if(!this.privateChannel) {
      this.privateChannel = this.subscribeToPrivateChannel();
    }

    if(!this.bind) {
      this.bindChannels();
    }
  }

  private async subscribeToContactChannels() {
    for(let contactId of this.channels) {
      this.subscribeToPresenceChannel(contactId);
    }
  }

  private bindChannels() {
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

    this.privateChannel.bind('accepted_request', (data: any) => {
      this.acceptedRequestBehavior.next(data);
    });

    this.privateChannel.bind('offer', (message: any) => {
      if(this.rtcService.isActiveCall()) {
        return;
      }
      this.incomingCallBehavior.next(message);
    });

    this.privateChannel.bind('answer', (message: any) => {
      if(message.usernameFrom === this.rtcService.getContactUsername()) {
        this.answerBehavior.next(message);
      }
    });

    this.privateChannel.bind('reject', (message: any) => {
      this.rejectedCallBehavior.next(message);
    });

    this.privateChannel.bind('candidate', (message: any) => {
      this.rtcService.addCandidate(message);
      this.candidateBehavior.next(message);
    });

    this.privateChannel.bind('hang_up', (message: any) => {
      this.hangUpBehavior.next(message);
    });

    this.privateChannel.bind('chat_message', (message: any) => {
      this.chatBehavior.next(message);
    });

    this.bind = true;
  }

  handleIncomingCall() {
    this.incomingCallBehavior.next(false);
  }

  private sendLastOnline() {

  }

  private disconnect() {
    this.pusher.disconnect();
  }

  resetCall() {
    this.answerBehavior.next(false);
    this.candidateBehavior.next(false);
    this.incomingCallBehavior.next(false);
    this.rejectedCallBehavior.next(false);
    this.hangUpBehavior.next(false);
  }

  ngOnDestroy(): void {
    this.sendLastOnline();
    this.disconnect();
  }
}
