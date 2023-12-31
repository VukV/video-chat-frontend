import {AfterViewInit, Component, Input, OnDestroy} from '@angular/core';
import {MainComponent} from "../main.component";
import {RtcService} from "../../../services/rtc.service";
import {RTCMessageType} from "../../../model/rtc/rtc-message";
import {ToastrService} from "ngx-toastr";
import {PusherService} from "../../../services/pusher.service";
import {SoundService} from "../../../services/sound.service";
import {Router} from "@angular/router";
import {Subject, takeUntil} from "rxjs";

@Component({
  selector: 'app-incoming-call',
  templateUrl: './incoming-call.component.html',
  styleUrls: ['./incoming-call.component.css']
})
export class IncomingCallComponent implements AfterViewInit, OnDestroy {

  displayStyle = "none";
  callerUsername: string = '';
  private offer: any;

  @Input()
  mainComponent!: MainComponent;

  private componentDestroyed = new Subject<void>();

  constructor(private pusherService: PusherService, private rtcService: RtcService, private toastr: ToastrService,
              private soundService: SoundService, private router: Router) {
  }

  ngAfterViewInit(): void {
    this.initListeners();
  }

  initListeners() {
    this.pusherService.hangUp
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe((data) => {
        if(data.usernameFrom == this.callerUsername) {
          this.pusherService.resetCall();
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
        this.pusherService.resetCall();
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
    }
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }

}
