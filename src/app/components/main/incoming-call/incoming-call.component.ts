import {AfterViewInit, Component, Input} from '@angular/core';
import {MainComponent} from "../main.component";
import {RtcService} from "../../../services/rtc.service";
import {RTCMessageType} from "../../../model/rtc/rtc-message";
import {ToastrService} from "ngx-toastr";
import {PusherService} from "../../../services/pusher.service";
import {SoundService} from "../../../services/sound.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-incoming-call',
  templateUrl: './incoming-call.component.html',
  styleUrls: ['./incoming-call.component.css']
})
export class IncomingCallComponent implements AfterViewInit{

  displayStyle = "none";
  callerUsername: string = '';
  private offer: any;

  @Input()
  mainComponent!: MainComponent;

  constructor(private pusherService: PusherService, private rtcService: RtcService, private toastr: ToastrService,
              private soundService: SoundService, private router: Router) {
  }

  ngAfterViewInit(): void {
    this.initListeners();
  }

  initListeners() {
    this.pusherService.hangUp.subscribe((data) => {
      if(data.usernameFrom == this.callerUsername) {
        this.close();
        this.soundService.playCallEnded();
      }
    })
  }

  answerCall(videoCall: boolean) {
    this.close();

    this.rtcService.setContactUsername(this.callerUsername);
    this.rtcService.setOffer(this.offer);
    this.rtcService.setCallerStatus(false);
    this.rtcService.setVideoCall(videoCall);

    this.router.navigate(['call']);
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
    this.soundService.playRinging();

    this.callerUsername = message.usernameFrom;
    this.offer = message.data;
    this.displayStyle = "block";
  }

  close(){
    if(this.displayStyle !== "none") {
      this.soundService.stopRinging();
      this.displayStyle = "none";
      console.log("POSTAVIO DISPLAY STYLE ", this.displayStyle)
    }
  }

}
