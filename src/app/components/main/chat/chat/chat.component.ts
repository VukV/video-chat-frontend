import {Component, Input, OnInit} from '@angular/core';
import {MainComponent} from "../../main.component";
import {RtcService} from "../../../../services/rtc.service";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit{

  chatContactUsername: string = '';

  @Input()
  mainComponent!: MainComponent;

  constructor(private rtcService: RtcService) {
  }

  ngOnInit(): void {
    this.rtcService.contactUsernameObservable.subscribe((username) => {
      this.chatContactUsername = username;
    });
  }

  closeChat() {
    this.mainComponent.setHomeComponent();
  }

  startCall(videoCall: boolean) {
    this.mainComponent.setCallComponent(videoCall, true);
  }

}
