import {Component, OnInit} from '@angular/core';

declare var bootstrap: any;

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnInit{

  toastMessage: string = ''
  toast: any;

  constructor() {
  }

  ngOnInit(): void {
    this.initToast();
  }

  private initToast() {
    let toastElement = document.querySelector('.toast');
    if(toastElement){
      this.toast = new bootstrap.Toast(toastElement);
    }
  }

  showToast(message: string) {
    this.toastMessage = message;
    this.toast.show();
  }
}
