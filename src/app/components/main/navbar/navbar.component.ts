import {Component, OnInit, ViewChild} from '@angular/core';
import {CurrentUserService} from "../../../services/current-user.service";
import {AddContactComponent} from "../add-contact/add-contact.component";
import {UserService} from "../../../services/user.service";
import {User} from "../../../model/user/user";
import {LoadingComponent} from "../../utils/loading/loading.component";
import {retry} from "rxjs";
import {ToastComponent} from "../../utils/toast/toast.component";

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

  @ViewChild(AddContactComponent)
  addContactComponent!: AddContactComponent;

  @ViewChild(LoadingComponent)
  loadingComponent!: LoadingComponent;

  @ViewChild(ToastComponent)
  toastComponent!: ToastComponent;

  constructor(private currentUserService: CurrentUserService, private userService: UserService) {
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
        this.toastComponent.showToast(error.message);
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

}
