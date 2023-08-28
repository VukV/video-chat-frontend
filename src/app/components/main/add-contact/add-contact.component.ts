import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {UserService} from "../../../services/user.service";
import {debounceTime, Subject} from "rxjs";
import {User} from "../../../model/user/user";
import {ContactRequestService} from "../../../services/contact-request.service";
import {ToastrService} from "ngx-toastr";

declare var bootstrap: any;

@Component({
  selector: 'app-add-contact',
  templateUrl: './add-contact.component.html',
  styleUrls: ['./add-contact.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AddContactComponent implements OnInit {

  displayStyle = "none";

  loading: boolean = false;
  errorText: string = "";

  usernameSearch: string = "";
  private searchSubject: Subject<void> = new Subject<void>();
  users: User[] = [];

  page: number = 1;
  totalItems: number = 0;
  pageSize: number = 4;

  constructor(private userService: UserService, private contactRequestService: ContactRequestService, private toastr: ToastrService) {
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.search();
    });
  }

  ngOnInit(): void {
    this.initTooltip();
  }

  private initTooltip() {
    let tooltipElement = document.getElementById('request-icon');
    if(tooltipElement){
      return new bootstrap.Tooltip(tooltipElement);
    }
  }

  onSearchInput() {
    this.users = [];
    this.loading = true;
    this.searchSubject.next();
  }

  search() {
    this.errorText = '';
    if(this.usernameSearch == '') {
      this.loading = false;
      return;
    }

    this.userService.search(this.usernameSearch, this.page - 1, this.pageSize).subscribe({
      complete: () => {

      },
      error: (error) => {
        this.loading = false;
        this.errorText = error.message;
      },
      next: (users) => {
        this.users = users.content;
        this.totalItems = users.totalElements;
        this.loading = false;
      }
    });
  }

  pageChangeEvent(event: number){
    this.page = event;
    this.search();
  }

  sendRequest(username: string) {
    this.errorText = '';

    this.contactRequestService.sendRequest(username).subscribe({
      complete: () => {

      },
      error: (error) => {
        this.errorText = error.message;
      },
      next: () => {
        this.toastr.info("Contact request sent.");
      }
    });
  }

  open() {
    this.displayStyle = "block";
  }

  close(){
    this.displayStyle = "none";
  }
}
