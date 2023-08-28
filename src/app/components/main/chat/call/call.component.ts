import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {environment} from "../../../../../environments/environment";
import {ToastrService} from "ngx-toastr";
import {RTCMessageType} from "../../../../model/rtc/rtc-message";
import {RtcService} from "../../../../services/rtc.service";
import {PusherService} from "../../../../services/pusher.service";
import {SoundService} from "../../../../services/sound.service";
import {Router} from "@angular/router";
import {Subject, takeUntil} from "rxjs";

@Component({
  selector: 'app-call',
  templateUrl: './call.component.html',
  styleUrls: ['./call.component.css']
})
export class CallComponent implements AfterViewInit, OnDestroy {

  private localStream: any;
  private remoteStream: any;
  private peerConnection: any;

  private isCaller: boolean = true;
  private contactUsername: string = '';

  @ViewChild('localVideo') localVideo!: ElementRef;
  @ViewChild('contactVideo') contactVideo!: ElementRef;

  usingCamera: boolean = false;
  usingMicrophone: boolean = true;

  private componentDestroyed = new Subject<void>();

  constructor(private rtcService: RtcService, private pusherService: PusherService, private toastr: ToastrService,
              private soundService: SoundService, private router: Router) {
  }

  ngAfterViewInit(): void {
    this.isCaller = this.rtcService.getCallerStatus();
    this.contactUsername = this.rtcService.getContactUsername();

    if(this.contactUsername === '') {
      this.close();
      return;
    }

    if(this.isCaller) {
      this.createOffer().then(() => {
        this.handleCandidates();
      });
    }
    else {
      this.createAnswer(this.rtcService.getOffer()).then(() => {
        this.handleCandidates();
      });
    }

    this.rtcService.setActiveCall(true);
  }

  private async initLocalStream() {
    this.localStream = await navigator.mediaDevices.getUserMedia(environment.rtc.constraints);

    this.usingCamera = this.rtcService.isVideoCall();
    if(!this.usingCamera) {
      await this.disableCamera()
    }

    try {
      this.localVideo.nativeElement.srcObject = this.localStream;
    } catch(error) {
      this.toastr.error('Error accessing media devices.');
    }
  }

  private async createPeerConnection() {
    this.peerConnection = new RTCPeerConnection(environment.rtc.servers);
    console.log("NAPRAVIO PEER CONNECTION");

    this.remoteStream = new MediaStream();
    this.contactVideo.nativeElement.srcObject = this.remoteStream;

    if(!this.localStream) {
      await this.initLocalStream();
    }

    this.localStream.getTracks().forEach((track: MediaStreamTrack) => {
      this.peerConnection.addTrack(track, this.localStream);
    });

    this.initPeerHandlers();
    this.initHandlers();
  }

  private initPeerHandlers() {
    this.peerConnection.addEventListener('track', this.trackEventHandler);
    this.peerConnection.onicecandidate = this.iceCandidateHandler;
  }

  private trackEventHandler = async (event: any) => {
    let [remoteStream] = event.streams;
    this.contactVideo.nativeElement.srcObject = remoteStream;
  };

  private iceCandidateHandler = async (event: any) => {
    if (event.candidate) {
      this.sendMessage(RTCMessageType.CANDIDATE, event.candidate);
    }
  };

  private clearHandlers() {
    if(this.peerConnection) {
      this.peerConnection.removeEventListener('track', this.trackEventHandler);
      this.peerConnection.onicecandidate = null;
    }
  }

  private handleCandidates() {
    if (this.peerConnection && this.peerConnection.iceConnectionState !== 'closed') {
      for(let candidate of this.rtcService.getCandidates()) {
        if(candidate.usernameFrom == this.contactUsername) {
          console.log("HANDLE ICE")
          this.addIceCandidate(candidate.data);
        }
      }
    }

    this.rtcService.clearCandidates();
  }

  private async createOffer() {
    await this.createPeerConnection();

    let offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    this.sendMessage(RTCMessageType.OFFER, offer);
    console.log("POSLAO OFFER");

    //todo start counter
  }

  private async createAnswer(offer: any) {
    await this.createPeerConnection();
    await this.peerConnection.setRemoteDescription(offer);

    let answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    this.sendMessage(RTCMessageType.ANSWER, answer);
    console.log("POSLAO ANSWER")
  }

  private async addAnswer(answer: any) {
    if(!this.peerConnection.currentRemoteDescription) {
      console.log("DODAJE ANSWER (REMOTE DESC)")
      this.peerConnection.setRemoteDescription(answer);
    }
  }

  private async addIceCandidate(candidate: any) {
    if(this.peerConnection) {
      console.log("POKUSAVA DA DODA ICE ", candidate)
      this.peerConnection.addIceCandidate(candidate);
      console.log("DODAO ICE")
    }
  }

  private sendMessage(type: RTCMessageType, data: any) {
    this.rtcService.sendMessage(type, data, this.contactUsername).subscribe({
      complete: () => {

      },
      error: (error) => {
        this.toastr.error(error.message);
      },
      next: () => {

      }
    });
  }

  async toggleCamera() {
    let videoTrack = this.localStream.getTracks().find((track: MediaStreamTrack) => track.kind === 'video');

    this.usingCamera = !videoTrack.enabled;
    videoTrack.enabled = this.usingCamera;
  }

  async toggleMicrophone() {
    let audioTrack = this.localStream.getTracks().find((track: MediaStreamTrack) => track.kind === 'audio');

    this.usingMicrophone = !audioTrack.enabled;
    audioTrack.enabled = this.usingMicrophone;
  }

  private async disableCamera() {
    let videoTrack = this.localStream.getTracks().find((track: MediaStreamTrack) => track.kind === 'video');
    videoTrack.enabled = false;
  }

  private initHandlers() {
    this.pusherService.rejectedCall
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe((rejected) => {
        if(rejected && rejected.usernameFrom == this.contactUsername) {
          if(this.rtcService.isActiveCall()) {
            this.callEnded();
          }
        }
    });

    this.pusherService.answer
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe((message) => {
        if(message) {
          console.log("SUB NA ANSWER ", message)
          this.addAnswer(message.data);
        }
    });

    this.pusherService.candidate
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe((message) => {
        if(message) {
          if(this.peerConnection.remoteDescription) {
            console.log("PUSHER ICE")
            this.addIceCandidate(message.data);
          }
        }
    });

    this.pusherService.hangUp
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe((hangUp) => {
        if(hangUp.usernameFrom == this.contactUsername) {
          this.callEnded();
        }
    });
  }

  private removeHandlers() {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();

    this.pusherService.resetCall();
  }

  leaveCall() {
    this.disconnect();
    this.sendMessage(RTCMessageType.HANG_UP, null);
    this.close();
  }

  private disconnect() {
    if(this.localStream) {
      this.localStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      this.localStream = null;
    }

    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      this.remoteStream = null;
    }

    this.clearHandlers();

    this.peerConnection.close();
    console.log("ODRADJEN PEER CONNECTION CLOSE")
    this.rtcService.clearCandidates();
    this.rtcService.setActiveCall(false);
  }

  private close() {
    this.removeHandlers();
    this.soundService.playCallEnded();
    this.router.navigate(['']);
  }

  callEnded() {
    this.disconnect();
    this.close();
  }

  ngOnDestroy(): void {
    console.log("POZVAN DESTROY")
  }

}
