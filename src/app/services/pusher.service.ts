import { Injectable } from '@angular/core';
import Pusher, {Channel} from "pusher-js";
import {environment} from "../../environments/environment";
import {HttpHeaders} from "@angular/common/http";
import {CurrentUserService} from "./current-user.service";

@Injectable({
  providedIn: 'root'
})
export class PusherService {

  private pusher: any;

  private contactChannelId: number = this.currentUserService.getUserId()

  private headers = new HttpHeaders({
    'Authorization': 'Bearer ' + sessionStorage.getItem("jwt")
  });

  constructor(private currentUserService: CurrentUserService) {
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

  disconnect() {
    this.pusher.disconnect();
  }
}
