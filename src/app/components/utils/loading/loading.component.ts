import { Component } from '@angular/core';
import {NgxSpinnerService} from "ngx-spinner";

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css']
})
export class LoadingComponent {

  constructor(private spinner: NgxSpinnerService) {}

  start() {
    this.spinner.show();
  }

  stop() {
    this.spinner.hide();
  }
}
