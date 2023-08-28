import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {MainComponent} from "../../main.component";
import {RtcService} from "../../../../services/rtc.service";
import {ChatService} from "../../../../services/chat.service";
import {PusherService} from "../../../../services/pusher.service";
import {ChatMessage} from "../../../../model/chat/chat-message";
import {Subject, takeUntil} from "rxjs";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {

  chatContactUsername: string = '';
  messages: ChatMessage[] = [];

  @Input()
  mainComponent!: MainComponent;

  private componentDestroyed = new Subject<void>();

  constructor(private rtcService: RtcService, private chatService: ChatService, private pusherService: PusherService) {
  }

  ngOnInit(): void {
    this.rtcService.contactUsernameObservable.subscribe((username) => {
      this.chatContactUsername = username;
    });

    this.initListeners();
  }

  initListeners() {
    this.pusherService.newChatMessage
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe((message: ChatMessage) => {
      if(message) {
        if(message.usernameFrom == this.chatContactUsername) {
          this.messages.push(message);
        }
      }
    });
  }

  sendMessage() {
    console.log("SENDING")
  }

  closeChat() {
    this.mainComponent.setHomeComponent();
  }

  startCall(videoCall: boolean) {
    this.mainComponent.setCallComponent(videoCall, true);
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }

}
