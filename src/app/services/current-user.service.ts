import { Injectable } from '@angular/core';
import {Router} from "@angular/router";
import {BehaviorSubject} from "rxjs";
import {JwtPayload} from "../model/jwt-payload";
import jwtDecode from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class CurrentUserService {

  private loggedInBehavior = new BehaviorSubject(this.getLoginStatus());
  isLoggedIn = this.loggedInBehavior.asObservable();

  constructor(private router: Router) { }

  getToken(): string{
    return sessionStorage.getItem("jwt") || "";
  }

  setLoggedInBehavior(loggedIn: boolean){
    this.loggedInBehavior.next(loggedIn);
  }

  private getLoginStatus(): boolean{
    return !!sessionStorage.getItem("jwt");
  }

  login(jwt: string){
    sessionStorage.setItem("jwt", jwt);
    this.loggedInBehavior.next(true);
  }

  getUserId(): number{
    let token = sessionStorage.getItem("jwt");
    if(token == null){
      return -1;
    }

    let decoded = jwtDecode<JwtPayload>(token);
    return decoded.userId;
  }

  getUsername(): string {
    let token = sessionStorage.getItem("jwt");
    if(token == null){
      return "";
    }

    let decoded = jwtDecode<JwtPayload>(token);
    return decoded.sub;
  }

  getFirstUserLetter(): string {
    let token = sessionStorage.getItem("jwt");
    if(token == null){
      return "";
    }

    let decoded = jwtDecode<JwtPayload>(token);
    return decoded.sub.substring(0,1).toUpperCase();
  }

  logout(){
    sessionStorage.removeItem("jwt");
    this.setLoggedInBehavior(false);
    this.router.navigate(['/login']);
  }

}
