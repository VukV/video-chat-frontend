import { Injectable } from '@angular/core';
import Pusher from "pusher-js";

@Injectable({
  providedIn: 'root'
})
export class PusherService {

  private pusher: any;

  constructor() {
    this.pusher = new Pusher("", {
      cluster: ''
    })
  }
}
