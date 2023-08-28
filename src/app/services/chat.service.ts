import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {CurrentUserService} from "./current-user.service";
import {environment} from "../../environments/environment";
import {ContactRequest} from "../model/contact-request/contact-request";
import {catchError, Observable, throwError} from "rxjs";
import {ExceptionMessages} from "../model/exception-messages";
import {ChatMessage} from "../model/chat/chat-message";

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private chatUrl: string = environment.chatUrl;

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

  sendMessage(usernameTo: string, text: string): Observable<ChatMessage> {
    return this.httpClient.post<ChatMessage>(this.chatUrl,
      {
        usernameTo: usernameTo,
        text: text
      },
      {
        headers: this.headers
      })
      .pipe(
        catchError(err => {
          let message = ExceptionMessages.SEND_REQUEST_ERROR;
          if(err.error){
            message = err.error.message;
          }
          return throwError(() => new Error(message));
        })
      );
  }

  getMessagesWithUser(contactUsername: string): Observable<ChatMessage[]> {
    return this.httpClient.get<ChatMessage[]>(this.chatUrl + '/' + contactUsername,
      {
        headers: this.headers
      })
      .pipe(
        catchError(err => {
          let message = ExceptionMessages.GET_CHAT_MESSAGES_ERROR;
          if(err.error){
            message = err.error.message;
          }
          return throwError(() => new Error(message));
        })
      );
  }


}
