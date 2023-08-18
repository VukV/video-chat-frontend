import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit{

  chatContactUsername: string = '';

  constructor() {
  }

  ngOnInit(): void {
    //todo
  }

  setUser(username: string) {
    this.chatContactUsername = username;

    //todo
  }

}
