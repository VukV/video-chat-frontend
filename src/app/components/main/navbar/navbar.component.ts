import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CurrentUserService} from "../../../services/current-user.service";
import {AddContactComponent} from "../add-contact/add-contact.component";
import {UserService} from "../../../services/user.service";
import {User} from "../../../model/user/user";
import {LoadingComponent} from "../../utils/loading/loading.component";
import {retry} from "rxjs";
import {ToastrService} from "ngx-toastr";
import {MainComponent} from "../main.component";
import {PusherService} from "../../../services/pusher.service";
import Pusher from "pusher-js";
import {ExceptionMessages} from "../../../model/exception-messages";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {

  username: string = '';

  //TODO
  onlineContacts: User[] = [];
  offlineContacts: User[] = [];

  private presenceChannel: any;
  private channels: number[] = [];

  @Input()
  mainComponent!: MainComponent;

  @ViewChild(AddContactComponent)
  addContactComponent!: AddContactComponent;

  @ViewChild(LoadingComponent)
  loadingComponent!: LoadingComponent;

  constructor(private pusherService: PusherService, private currentUserService: CurrentUserService, private userService: UserService, private toastr: ToastrService) {
  }

  ngOnInit(): void {
    this.username = this.currentUserService.getUsername();
    this.getUserContacts();
  }

  getUserContacts() {
    this.userService.getUserContacts().subscribe({
      complete: () => {
        this.loadingComponent.stop();
      },
      error: (error) => {
        retry(3);
        this.toastr.error(error.message)
      },
      next: (contacts) => {
        this.onlineContacts = contacts;
        this.loadingComponent.stop();

        this.initChannelList();
        this.subscribeToChannels();
      }
    });
  }

  private subscribeToChannels() {
    this.presenceChannel = this.pusherService.subscribeToPresenceChannel(this.currentUserService.getUserId());

    for(let contactId of this.channels) {
      this.pusherService.subscribeToPresenceChannel(contactId);
    }

    this.bindChannel();
  }

  private bindChannel() {
    this.presenceChannel.bind("pusher:subscription_succeeded", () => {
      console.log("Subscribed to channel.");
      this.checkForOnlineContacts();
    });

    this.presenceChannel.bind("pusher:subscription_error", (error: any) => {
      this.toastr.error(ExceptionMessages.PUSHER_SOCKET_ERROR);
    });

    this.presenceChannel.bind('pusher:member_added', (data: any) => {
      console.log('Member added:', data);
    });

    this.presenceChannel.bind('pusher:member_removed', (data: any) => {
      console.log('Member removed:', data);
    });
  }

  private initChannelList() {
    for(let contact of this.onlineContacts) {
      this.channels.push(contact.userId);
    }
  }

  private checkForOnlineContacts() {
    console.log(this.presenceChannel.members);
  }

  private moveToOnline() {

  }

  private moveToOffline() {

  }

  openAddContact() {
    this.addContactComponent.open();
  }

  openChat(username: string) {
    this.mainComponent.setChatComponent(username);
  }

  ngOnDestroy() {
    this.pusherService.disconnect();
  }

}
