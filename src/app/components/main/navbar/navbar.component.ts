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
import {ComponentType} from "../../../model/component-type";
import {isSubscription} from "rxjs/internal/Subscription";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements AfterViewInit, OnInit {

  username: string = '';

  onlineContacts: User[] = [];
  offlineContacts: User[] = [];

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
    this.initHandlers();
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

        this.pusherService.initChannelList(this.offlineContacts);
        this.pusherService.subscribeToChannels();
      }
    });
  }

  initHandlers() {
    this.pusherService.isSubscribed.subscribe((isSubscribed) => {
      if(isSubscribed){
        this.checkForOnlineContacts();
      }
    });

    this.pusherService.onlineContact.subscribe((username) => {
      if(username) {
        this.contactOnlineHandler(username);
      }
    });

    this.pusherService.offlineContact.subscribe((username) => {
      if(username) {
        this.contactOfflineHandler(username);
      }
    });

    this.pusherService.acceptedRequest.subscribe((data) => {
      if(data) {
        this.contactAcceptedHandler(data);
      }
    });
  }

  private contactAcceptedHandler(newContact: User) {
    this.toastr.info(newContact.username + " is your new contact.");

    this.pusherService.addChannel(newContact.userId);
    this.offlineContacts.push(newContact);
    this.pusherService.subscribeToPresenceChannel(newContact.userId);
  }

  private checkForOnlineContacts() {
    let onlineList = this.pusherService.presenceChannel.members;

    for (let memberId in onlineList.members) {
      let username = onlineList.members[memberId].username;
      this.contactOnlineHandler(username);
    }
  }

  private contactOnlineHandler(username: string) {
    if(username === this.currentUserService.getUsername()) {
      return;
    }

    let contactIndex = this.offlineContacts.findIndex(c => c.username === username);

    if (contactIndex !== -1) {
      let userToMove = this.offlineContacts.splice(contactIndex, 1)[0];
      this.onlineContacts.push(userToMove);
    }
  }

  private contactOfflineHandler(username: string) {
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

  openSettings() {
    //TODO
  }

}
