import {Component, OnInit, ViewChild} from '@angular/core';
import {CurrentUserService} from "../../../services/current-user.service";
import {AddContactComponent} from "../add-contact/add-contact.component";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  username: string = '';

  @ViewChild(AddContactComponent)
  addContactComponent!: AddContactComponent;

  constructor(private currentUserService: CurrentUserService) {
  }

  ngOnInit(): void {
    this.username = this.currentUserService.getUsername();
  }

  openAddContact() {
    this.addContactComponent.open();
  }

}
