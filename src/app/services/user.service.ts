import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {CurrentUserService} from "./current-user.service";
import {environment} from "../../environments/environment";
import {catchError, Observable, throwError} from "rxjs";
import {LoginResponse} from "../model/login/login-response";
import {UserSearch} from "../model/user/user-search";
import {User} from "../model/user/user";
import {ExceptionMessages} from "../model/exception-messages";


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
          let message = ExceptionMessages.LOGIN_ERROR;
          if(err.error){
            message = err.error.message;
          }
          return throwError(() => new Error(message));
        })
      );
  }

  search(username: string, page: number, size: number): Observable<UserSearch> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append("username", username);
    queryParams = queryParams.append("page", page);
    queryParams = queryParams.append("size", size);

    return this.httpClient.get<UserSearch>(this.usersUrl,
      {
        headers: this.headers,
        params: queryParams
      })
      .pipe(
        catchError(err => {
          let message = ExceptionMessages.USER_SEARCH_ERROR;
          if(err.error){
            message = err.error.message;
          }
          return throwError(() => new Error(message));
        })
      );
  }

  getUserContacts(): Observable<User[]> {
    return this.httpClient.get<User[]>(this.usersUrl + '/contacts',
      {
        headers: this.headers
      })
      .pipe(
        catchError(err => {
          let message = ExceptionMessages.GET_CONTACTS_ERROR;
          if(err.error){
            message = err.error.message;
          }
          return throwError(() => new Error(message));
        })
      );
  }

}
