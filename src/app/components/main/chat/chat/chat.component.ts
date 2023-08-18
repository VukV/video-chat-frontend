import {Component, Input, OnInit} from '@angular/core';
import {MainComponent} from "../../main.component";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit{

  chatContactUsername: string = '';

  @Input()
  mainComponent!: MainComponent;

  constructor() {
  }

  ngOnInit(): void {
    this.chatContactUsername = this.mainComponent.currentChatUsername;
  }

  closeChat() {
    this.mainComponent.setHomeComponent();
  }

}
