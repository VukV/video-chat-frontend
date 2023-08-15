import { Component } from '@angular/core';
import {AnimationOptions} from "ngx-lottie";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  options: AnimationOptions = {
    path: '/assets/animations/home-animation.json',
  }

}
