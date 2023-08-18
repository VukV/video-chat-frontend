import {Component, ViewChild} from '@angular/core';
import {UserService} from "../../services/user.service";
import {CurrentUserService} from "../../services/current-user.service";
import {LoadingComponent} from "../utils/loading/loading.component";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  username: string = '';
  password: string = '';
  showPassword: boolean = false;

  errorText: string = '';

  @ViewChild(LoadingComponent)
  loadingComponent!: LoadingComponent;

  constructor(private userService: UserService, private currentUserService: CurrentUserService, private router: Router) {
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  login() {
    if(!this.validateInput()){
      return;
    }

    this.loadingComponent.start();
    this.userService.login(this.username, this.password).subscribe({
      complete: () => {

      },
      error: (error) => {
        this.loadingComponent.stop();
        if(error.message){
          //TODO open popup with message
        }
        else {
          //TODO open popup with fixed message
        }
      },
      next: (loginRes) => {
        this.currentUserService.login(loginRes.jwt);
        this.loadingComponent.stop();
        this.router.navigate(['']);
      }
    });
  }

  private validateInput(): boolean {
    this.errorText = '';

    if(this.username !== '' && this.password !=''){
      return true;
    }
    else {
      this.errorText = 'Please provide username and password.'
      return false;
    }
  }

}
