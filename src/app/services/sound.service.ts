import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SoundService {

  private ringingAudio: any;

  constructor() { }

  private loadAudio(path: string) {
    let audio = new Audio();
    audio.src = path;
    audio.load();
    return audio;
  }

  playCallEnded() {
    let callEnded = this.loadAudio('/assets/sounds/call-end.mp3');
    callEnded.play();
  }

  playRinging() {
    this.ringingAudio = this.loadAudio('/assets/sounds/ringtone.mp3');
    this.ringingAudio.addEventListener("ended", () => this.playRinging());

    this.ringingAudio.play();
  }

  stopRinging() {
    this.ringingAudio.removeEventListener("ended", () => this.playRinging());
    this.ringingAudio.pause();
    this.ringingAudio.currentTime = 0;
  }

}
