import {AfterViewInit, Component, ElementRef, Input, ViewChild} from '@angular/core';
import {MainComponent} from "../../main.component";
import {environment} from "../../../../../environments/environment";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-call',
  templateUrl: './call.component.html',
  styleUrls: ['./call.component.css']
})
export class CallComponent implements AfterViewInit{

  private localStream: any;
  private remoteStream: any;
  private peerConnection: any;

  @Input()
  mainComponent!: MainComponent;

  @ViewChild('localVideo') localVideo!: ElementRef;

  usingCamera: boolean = false;
  usingMicrophone: boolean = true;

  constructor(private toastr: ToastrService) {
  }

  ngAfterViewInit(): void {
    this.initLocalStream().then(() => this.startCall());
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

  private startCall() {
    //TODO
    console.log(this.usingCamera);
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

}
