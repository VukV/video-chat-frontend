import {AfterViewInit, Component, ElementRef, Input, ViewChild} from '@angular/core';
import {MainComponent} from "../../main.component";
import {environment} from "../../../../../environments/environment";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-call',
  templateUrl: './call.component.html',
  styleUrls: ['./call.component.css']
})
export class CallComponent implements AfterViewInit {

  private localStream: any;
  private remoteStream: any;
  private peerConnection: any;

  //TODO: move constraints here?

  @Input()
  mainComponent!: MainComponent;
  private isCaller: boolean = true;

  @ViewChild('localVideo') localVideo!: ElementRef;
  @ViewChild('contactVideo') contactVideo!: ElementRef;

  usingCamera: boolean = false;
  usingMicrophone: boolean = true;

  displayStyle: string = 'none';

  constructor(private toastr: ToastrService) {
  }

  ngAfterViewInit(): void {
    if(this.isCaller) {
      this.initLocalStream().then(() => {});
    }
    else {
      this.initLocalStream().then(() => {});
    }
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

    this.peerConnection.ontrack = (event: any) => {
      event.streams[0].getTracks().forEach((track: MediaStreamTrack) => {
        this.remoteStream.addTrack(track);
      });
    }

    this.peerConnection.onicecandidate = async (event:any) => {
      if(event.candidate){
        //TODO send candidate message
      }
    }
  }

  private async createOffer() {
    await this.createPeerConnection();

    let offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer)

    //TODO send offer message
  }

  private async createAnswer(offer: any) {
    await this.createPeerConnection();
    await this.peerConnection.setRemoteDescription(offer);

    let answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    //TODO send answer message
  }

  private async addAnswer(answer: any) {
    if(this.peerConnection.currentRemoteDescription) {
      this.peerConnection.setRemoteDescription(answer);
    }
  }

  private async addIceCandidate(candidate: any) {
    if(this.peerConnection) {
      this.peerConnection.addIceCandidate(candidate);
    }
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
