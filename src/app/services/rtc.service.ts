import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {CurrentUserService} from "./current-user.service";
import {environment} from "../../environments/environment";
import {RTCMessage, RTCMessageType} from "../model/rtc/rtc-message";

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
    //TODO send message
  }
}
