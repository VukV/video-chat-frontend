import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {CurrentUserService} from "./current-user.service";
import {environment} from "../../environments/environment";
import {RTCMessage, RTCMessageType} from "../model/rtc/rtc-message";
import {BehaviorSubject, catchError, of, throwError} from "rxjs";
import {ExceptionMessages} from "../model/exception-messages";

@Injectable({
  providedIn: 'root'
})
export class RtcService {

  private rtcUrl: string = environment.rtcUrl;

  private isCaller: boolean = true;
  private videoCall: boolean = false;

  private contactUsername: string = '';
  private usernameBehavior: BehaviorSubject<string> = new BehaviorSubject<any>('');
  contactUsernameObservable = this.usernameBehavior.asObservable();

  private currentOffer: any;
  private candidates: any[] = [];

  private activeCall: boolean = false;

  private headers = new HttpHeaders({
    'Authorization': 'Bearer ' + sessionStorage.getItem("jwt")
  });

  constructor(private httpClient: HttpClient, private currentUserService: CurrentUserService) {
    this.currentUserService.isLoggedIn.subscribe((loggedIn) => {
      if(loggedIn){
        this.headers = new HttpHeaders({
          'Authorization': 'Bearer ' + sessionStorage.getItem("jwt")
        });
      }
    });
  }

  sendMessage(type: RTCMessageType, data: any, sendTo: string) {
    let message = new RTCMessage(type, this.currentUserService.getUsername(), sendTo, data);
    return this.httpClient.post(this.rtcUrl + '/message', message,
      {
        headers: this.headers
      })
      .pipe(
        catchError(err => {
          let message = ExceptionMessages.PUSHER_RTC_ERROR;
          if(err.error){
            message = err.error.message;
          }
          return throwError(() => new Error(message));
        })
      );
  }

  setCallerStatus(isCaller: boolean) {
    this.isCaller = isCaller;
  }

  getCallerStatus(): boolean {
    return this.isCaller;
  }

  setContactUsername(username: string) {
    this.contactUsername = username;
    this.usernameBehavior.next(username);
  }

  getContactUsername(): string {
    return this.contactUsername;
  }

  setOffer(offer: any) {
    this.currentOffer = offer;
  }

  getOffer() {
    return this.currentOffer;
  }

  addCandidate(candidate: any) {
    this.candidates.push(candidate);
  }

  clearCandidates() {
    this.candidates = [];
  }

  getCandidates() {
    return this.candidates;
  }

  setActiveCall(isActive: boolean) {
    this.activeCall = isActive;
  }

  isActiveCall(): boolean {
    return this.activeCall;
  }

  setVideoCall(videoCall: boolean) {
    this.videoCall = videoCall;
  }

  isVideoCall(): boolean {
    return this.videoCall;
  }

}
