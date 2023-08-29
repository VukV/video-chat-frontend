import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MainComponent} from "../../main.component";
import {RtcService} from "../../../../services/rtc.service";
import {ChatService} from "../../../../services/chat.service";
import {PusherService} from "../../../../services/pusher.service";
import {ChatMessage} from "../../../../model/chat/chat-message";
import {Subject, takeUntil} from "rxjs";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {

  chatContactUsername: string = '';
  messages: ChatMessage[] = [];
  currentMessage: string = '';

  @Input()
  mainComponent!: MainComponent;

  @ViewChild('messagesContainer')
  messagesContainer!: ElementRef;

  private componentDestroyed = new Subject<void>();

  constructor(private rtcService: RtcService, private chatService: ChatService, private pusherService: PusherService,
              private toastr: ToastrService) {
  }

  ngOnInit(): void {
    this.rtcService.contactUsernameObservable.subscribe((username) => {
      this.chatContactUsername = username;
    });

    this.getMessages();
    this.initListeners();
  }

  initListeners() {
    this.pusherService.newChatMessage
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe((message: ChatMessage) => {
        if(message) {
          if(message.usernameFrom == this.chatContactUsername) {
            this.messages.push(message);
            this.scrollMessagesToBottom();
          }
        }
    });
  }

  getMessages() {
    this.chatService.getMessagesWithUser(this.chatContactUsername).subscribe({
      complete: () => {
        this.scrollMessagesToBottom();
      },
      error: (error) => {
        this.toastr.error(error.message);
      },
      next: (messages) => {
        this.messages = messages;
      }
    });
  }

  sendMessage() {
    let text = this.currentMessage;
    this.currentMessage = '';

    this.chatService.sendMessage(this.chatContactUsername, text).subscribe({
      complete: () => {

      },
      error: (error) => {
        this.toastr.error(error.message);
      },
      next: (message) => {
        this.messages.push(message);
        this.scrollMessagesToBottom();
      }
    });
  }

  scrollMessagesToBottom() {
    setTimeout(() => {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    }, 0);
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
