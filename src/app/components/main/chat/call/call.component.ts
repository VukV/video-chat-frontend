import {AfterViewInit, Component, Input} from '@angular/core';
import {MainComponent} from "../../main.component";

@Component({
  selector: 'app-call',
  templateUrl: './call.component.html',
  styleUrls: ['./call.component.css']
})
export class CallComponent implements AfterViewInit{

  @Input()
  mainComponent!: MainComponent;

  private videoCall: boolean = false;

  constructor() {
  }

  ngAfterViewInit(): void {
    this.startCall()
  }

  startCall() {
    this.videoCall = this.mainComponent.isVideoCall();

    //TODO
    console.log(this.videoCall);
  }

}
