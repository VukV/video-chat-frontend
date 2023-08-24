import {Component, Input} from '@angular/core';
import {MainComponent} from "../main.component";
import {RtcService} from "../../../services/rtc.service";
import {RTCMessageType} from "../../../model/rtc/rtc-message";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-incoming-call',
  templateUrl: './incoming-call.component.html',
  styleUrls: ['./incoming-call.component.css']
})
export class IncomingCallComponent {

  displayStyle = "none";
  callerUsername: string = '';
  private offer: any;

  @Input()
  mainComponent!: MainComponent;


  constructor(private rtcService: RtcService, private toastr: ToastrService) {
  }

  answerCall(videoCall: boolean) {
    this.close();
    this.rtcService.setContactUsername(this.callerUsername);
    this.rtcService.setOffer(this.offer);
    this.mainComponent.setCallComponent(videoCall, false);
  }

  rejectCall() {
    this.rtcService.sendMessage(RTCMessageType.REJECT, null, this.callerUsername).subscribe({
      complete: () => {
        this.close();
      },
      error: (error) => {
        this.toastr.error(error.message);
      },
      next: () => {

      }
    });
  }

  open(message: any) {
    this.callerUsername = message.usernameFrom;
    this.offer = message.data;
    this.displayStyle = "block";
  }

  close(){
    this.displayStyle = "none";
  }

}
