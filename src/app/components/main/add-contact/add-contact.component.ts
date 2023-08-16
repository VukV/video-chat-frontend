import { Component } from '@angular/core';
import {UserService} from "../../../services/user.service";
import {debounceTime, Subject} from "rxjs";

@Component({
  selector: 'app-add-contact',
  templateUrl: './add-contact.component.html',
  styleUrls: ['./add-contact.component.css']
})
export class AddContactComponent {

  displayStyle = "none";

  loading: boolean = false;
  errorText: string = "";

  usernameSearch: string = "";
  private searchSubject: Subject<void> = new Subject<void>();


  constructor(private userService: UserService) {
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.search();
    });
  }

  onSearchInput() {
    this.searchSubject.next();
  }

  search() {
    //fetch from server
    console.log(this.usernameSearch);
  }

  open() {
    this.displayStyle = "block";
  }

  close(){
    this.displayStyle = "none";
  }
}
