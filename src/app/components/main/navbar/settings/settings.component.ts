import {Component, OnInit} from '@angular/core';
import {RtcService} from "../../../../services/rtc.service";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit{

  displayStyle: string = 'none';

  cameras: MediaDeviceInfo[] = [];
  microphones: MediaDeviceInfo[] = [];

  selectedCamera: string = '';
  selectedMicrophone: string = '';


  constructor(private rtcService: RtcService) {
  }

  ngOnInit(): void {
    this.getCameras();
    this.getMicrophones();
  }

  async getCameras() {
    this.cameras = await this.getConnectedDevices('videoinput');

    let selected = this.rtcService.getSelectedCamera();
    if(selected !== '') {
      this.selectedCamera = selected;
      return;
    }

    if (this.cameras.length > 0) {
      this.selectedCamera = this.cameras[0].deviceId;
      this.updateDevices();
    }
  }

  async getMicrophones() {
    this.microphones = await this.getConnectedDevices('audioinput');

    let selected = this.rtcService.getSelectedMicrophone();
    if(selected !== '') {
      this.selectedMicrophone = selected;
      return;
    }

    if (this.microphones.length > 0) {
      this.selectedMicrophone = this.microphones[0].deviceId;
      this.updateDevices();
    }
  }

  private async getConnectedDevices(kind: MediaDeviceKind): Promise<MediaDeviceInfo[]> {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === kind);
  }

  updateDevices() {
    this.rtcService.updateMediaDevices(this.selectedCamera, this.selectedMicrophone);
  }

  open() {
    this.displayStyle = 'block';
  }

  close() {
    this.displayStyle = 'none';
  }

}
