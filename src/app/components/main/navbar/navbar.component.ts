import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {CurrentUserService} from "../../../services/current-user.service";
import {AddContactComponent} from "../add-contact/add-contact.component";
import {UserService} from "../../../services/user.service";
import {User} from "../../../model/user/user";
import {LoadingComponent} from "../../utils/loading/loading.component";
import {retry} from "rxjs";
import {ToastrService} from "ngx-toastr";
import {MainComponent} from "../main.component";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  username: string = '';

  //TODO
  onlineContacts: User[] = [];
  offlineContacts: User[] = [];

  @Input()
  mainComponent!: MainComponent;

  @ViewChild(AddContactComponent)
  addContactComponent!: AddContactComponent;

  @ViewChild(LoadingComponent)
  loadingComponent!: LoadingComponent;

  constructor(private currentUserService: CurrentUserService, private userService: UserService, private toastr: ToastrService) {
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
      }
    });
  }

  openAddContact() {
    this.addContactComponent.open();
  }

  openChat(username: string) {
    this.mainComponent.setChatComponent(username);
  }

}
