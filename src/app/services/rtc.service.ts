import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {CurrentUserService} from "./current-user.service";
import {environment} from "../../environments/environment";
import {RTCMessage, RTCMessageType} from "../model/rtc/rtc-message";
import {catchError, throwError} from "rxjs";
import {ExceptionMessages} from "../model/exception-messages";

@Injectable({
  providedIn: 'root'
})
export class RtcService {

  private rtcUrl: string = environment.rtcUrl;

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
    return this.httpClient.post(this.rtcUrl, message,
      {
        headers: this.headers
      })
      .pipe(
        catchError(err => {
          let message = ExceptionMessages.SEND_REQUEST_ERROR;
          if(err.error){
            message = err.error.message;
          }
          return throwError(() => new Error(message));
        })
      );
  }
}
