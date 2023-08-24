import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {CurrentUserService} from "./current-user.service";
import {environment} from "../../environments/environment";
import {RTCMessage, RTCMessageType} from "../model/rtc/rtc-message";
import {catchError, of, throwError} from "rxjs";
import {ExceptionMessages} from "../model/exception-messages";

@Injectable({
  providedIn: 'root'
})
export class RtcService {

  private rtcUrl: string = environment.rtcUrl;

  private isCaller: boolean = true;
  private contactUsername: string = '';
  private currentOffer: any;

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
}
