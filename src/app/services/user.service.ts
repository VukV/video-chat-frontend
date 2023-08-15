import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {CurrentUserService} from "./current-user.service";
import {environment} from "../../environments/environment";
import {catchError, Observable, throwError} from "rxjs";
import {LoginResponse} from "../model/login-response";


@Injectable({
  providedIn: 'root'
})
export class UserService {

  private loginUrl: string = environment.loginUrl;
  private usersUrl: string = environment.usersUrl;

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

  login(username: string, password: string): Observable<LoginResponse> {
    return this.httpClient.post<LoginResponse>(this.loginUrl,
      {
        username: username,
        password: password
      })
      .pipe(
        catchError(err => {
          return throwError(() => new Error(err.error.message))
        })
      );
  }

}
