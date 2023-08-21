import {AfterViewInit, Component, Inject, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
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
import {NgxSpinnerService} from "ngx-spinner";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements AfterViewInit, OnInit, OnDestroy {

  username: string = '';

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
  }

  ngAfterViewInit(): void {
    this.getInitialContacts();
  }

  getInitialContacts() {
    this.loadingComponent.start();

    this.userService.getUserContacts().subscribe({
      complete: () => {
        this.loadingComponent.stop();
      },
      error: (error) => {
        retry(3);
        this.toastr.error(error.message)
      },
      next: (contacts) => {
        this.offlineContacts = contacts;
        this.loadingComponent.stop();

        this.initChannelList();
        this.subscribeToChannels();
      }
    });
  }

  private contactAcceptedHandler(newContact: User) {
    this.toastr.info(newContact.username + " is your new contact.");

    this.channels.push(newContact.userId);
    this.offlineContacts.push(newContact);
    this.pusherService.subscribeToPresenceChannel(newContact.userId);
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
      this.moveToOnline(data.info.username);
    });

    this.presenceChannel.bind('pusher:member_removed', (data: any) => {
      this.moveToOffline(data.info.username);
    });

    this.presenceChannel.bind('accepted_request', (data: any) => {
      this.contactAcceptedHandler(data);
    });
  }

  private initChannelList() {
    for(let contact of this.offlineContacts) {
      this.channels.push(contact.userId);
    }
  }

  private checkForOnlineContacts() {
    let onlineList = this.presenceChannel.members;

    for (let memberId in onlineList.members) {
      let username = onlineList.members[memberId].username;
      this.moveToOnline(username);
    }
  }

  private moveToOnline(username: string) {
    if(username === this.currentUserService.getUsername()) {
      return;
    }

    let contactIndex = this.offlineContacts.findIndex(c => c.username === username);

    if (contactIndex !== -1) {
      let userToMove = this.offlineContacts.splice(contactIndex, 1)[0];
      this.onlineContacts.push(userToMove);
    }
  }

  private moveToOffline(username: string) {
    if(username === this.currentUserService.getUsername()) {
      return;
    }

    let contactIndex = this.onlineContacts.findIndex(c => c.username === username);

    if (contactIndex !== -1) {
      let userToMove = this.onlineContacts.splice(contactIndex, 1)[0];
      this.offlineContacts.push(userToMove);
    }
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
