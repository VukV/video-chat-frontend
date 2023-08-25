import {AfterViewInit, Component, ElementRef, Input, ViewChild} from '@angular/core';
import {MainComponent} from "../../main.component";
import {environment} from "../../../../../environments/environment";
import {ToastrService} from "ngx-toastr";
import {RTCMessageType} from "../../../../model/rtc/rtc-message";
import {RtcService} from "../../../../services/rtc.service";
import {PusherService} from "../../../../services/pusher.service";

@Component({
  selector: 'app-call',
  templateUrl: './call.component.html',
  styleUrls: ['./call.component.css']
})
export class CallComponent implements AfterViewInit {

  private localStream: any;
  private remoteStream: any;
  private peerConnection: any;

  @Input()
  mainComponent!: MainComponent;
  private isCaller: boolean = true;
  private contactUsername: string = '';

  @ViewChild('localVideo') localVideo!: ElementRef;
  @ViewChild('contactVideo') contactVideo!: ElementRef;

  usingCamera: boolean = false;
  usingMicrophone: boolean = true;

  constructor(private rtcService: RtcService, private pusherService: PusherService, private toastr: ToastrService) {
  }

  ngAfterViewInit(): void {
    this.isCaller = this.rtcService.getCallerStatus();
    this.contactUsername = this.rtcService.getContactUsername();

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

    this.initHandlers();
    this.initPeerHandlers();
  }

  private async initLocalStream() {
    this.localStream = await navigator.mediaDevices.getUserMedia(environment.rtc.constraints);

    this.usingCamera = this.mainComponent.isVideoCall();
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

    this.remoteStream = new MediaStream();
    this.contactVideo.nativeElement.srcObject = this.remoteStream;

    if(!this.localStream) {
      await this.initLocalStream();
    }

    this.localStream.getTracks().forEach((track: MediaStreamTrack) => {
      this.peerConnection.addTrack(track, this.localStream);
    });
  }

  private initPeerHandlers() {
    this.peerConnection.addEventListener('track', async (event: any) => {
      let [remoteStream] = event.streams;
      this.contactVideo.nativeElement.srcObject = remoteStream;
    });

    this.peerConnection.onicecandidate = async (event:any) => {
      if(event.candidate){
        this.sendMessage(RTCMessageType.CANDIDATE, event.candidate);
      }
    }
  }

  private handleCandidates() {
    for(let candidate of this.rtcService.getCandidates()) {
      if(candidate.usernameFrom == this.contactUsername) {
        this.addIceCandidate(candidate.data);
      }
    }

    this.rtcService.clearCandidates();
  }

  private async createOffer() {
    await this.createPeerConnection();

    let offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    this.sendMessage(RTCMessageType.OFFER, offer);
  }

  private async createAnswer(offer: any) {
    await this.createPeerConnection();
    await this.peerConnection.setRemoteDescription(offer);

    let answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    this.sendMessage(RTCMessageType.ANSWER, answer);
  }

  private async addAnswer(answer: any) {
    if(!this.peerConnection.currentRemoteDescription) {
      this.peerConnection.setRemoteDescription(answer);
    }
  }

  private async addIceCandidate(candidate: any) {
    if(this.peerConnection) {
      this.peerConnection.addIceCandidate(candidate);
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
    this.pusherService.rejectedCall.subscribe((rejected) => {
      if(rejected) {
        this.leaveCall();
      }
    });

    this.pusherService.answer.subscribe((message) => {
      if(message) {
        this.addAnswer(message.data);
      }
    });

    this.pusherService.candidate.subscribe((message) => {
      if(message) {
        if(this.peerConnection.remoteDescription) {
          this.addIceCandidate(message.data);
        }
      }
    });

    this.pusherService.hangUp.subscribe((hangUp) => {
      if(hangUp) {
        this.disconnect();
        this.close();
      }
    });
  }

  leaveCall() {
    this.disconnect();
    this.sendMessage(RTCMessageType.HANG_UP, null);
    this.close();
  }

  private disconnect() {
    this.localStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    this.peerConnection.close();
  }

  private close() {
    this.mainComponent.setChatComponent(this.contactUsername);
  }

  callEnded() {
    this.disconnect();
    close();
  }

}
