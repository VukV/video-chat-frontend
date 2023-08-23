export class RTCMessage {
  type: RTCMessageType;
  usernameFrom: string;
  usernameTo: string;
  data: any;

  constructor(type: RTCMessageType, usernameFrom: string, usernameTo: string, data: any) {
    this.type = type;
    this.usernameFrom = usernameFrom;
    this.usernameTo = usernameTo;
    this.data = data;
  }
}

export enum RTCMessageType {
  OFFER = 'OFFER',
  CANDIDATE = 'CANDIDATE',
  ANSWER = 'ANSWER',
  REJECT = 'REJECT'
}
