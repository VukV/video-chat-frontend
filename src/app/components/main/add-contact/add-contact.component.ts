import {Component, OnInit} from '@angular/core';
import {UserService} from "../../../services/user.service";
import {debounceTime, fromEvent, Subject} from "rxjs";
import {User} from "../../../model/user/user";

declare var bootstrap: any;

@Component({
  selector: 'app-add-contact',
  templateUrl: './add-contact.component.html',
  styleUrls: ['./add-contact.component.css']
})
export class AddContactComponent implements OnInit {

  displayStyle = "none";

  loading: boolean = false;
  errorText: string = "";

  usernameSearch: string = "";
  private searchSubject: Subject<void> = new Subject<void>();
  users: User[] = [];

  constructor(private userService: UserService) {
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.search();
    });
  }

  ngOnInit(): void {
    let tooltipElement = document.getElementById('request-icon');
    if(tooltipElement){
      return new bootstrap.Tooltip(tooltipElement);
    }
  }

  onSearchInput() {
    if(this.usernameSearch == ''){
      return;
    }
    this.users = [];
    this.loading = true;

    this.searchSubject.next();
  }

  search() {
    this.errorText = '';

    //TODO page, size
    this.userService.search(this.usernameSearch, 0, 10).subscribe({
      complete: () => {

      },
      error: (error) => {
        this.loading = false;
        if(error.message){
          this.errorText = error.message;
        }
        else {
          this.errorText = 'Error while fetching users.';
        }
      },
      next: (users) => {
        this.users = users.content;
        this.loading = false;
      }
    });
  }

  sendRequest() {
    //TODO
  }

  open() {
    this.displayStyle = "block";
  }

  close(){
    this.displayStyle = "none";
  }
}
