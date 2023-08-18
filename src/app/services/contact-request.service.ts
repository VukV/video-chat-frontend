import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {CurrentUserService} from "./current-user.service";
import {environment} from "../../environments/environment";
import {User} from "../model/user/user";
import {catchError, Observable, throwError} from "rxjs";
import {ContactRequest} from "../model/contact-request/contact-request";

@Injectable({
  providedIn: 'root'
})
export class ContactRequestService {

  private contactRequestsUrl: string = environment.contactRequestsUrl;

  private headers = new HttpHeaders({
    'Authorization': 'Bearer ' + sessionStorage.getItem("jwt")
  });

  constructor(private httpClient: HttpClient, private currentUserService: CurrentUserService) {
    this.currentUserService.isLoggedIn.subscribe((loggedIn) => {
      if(loggedIn){
        this.headers = new HttpHeaders({
          'Authorization': 'Bearer ' + sessionStorage.getItem("jwt")
        });
      }
    });
  }

  getMyRequests(): Observable<ContactRequest[]> {
    return this.httpClient.get<ContactRequest[]>(this.contactRequestsUrl,
      {
        headers: this.headers
      })
      .pipe(
        catchError(err => {
          return throwError(() => new Error(err.error.message))
        })
      );
  }

  sendRequest() {
    //TODO
  }

  handleRequest() {
    //TODO
  }
}
