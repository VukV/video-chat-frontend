export interface RTCMessage {
  type: RTCMessageType,
  username: string,
  data: any
}

export enum RTCMessageType {
  OFFER = 'OFFER',
  CANDIDATE = 'CANDIDATE',
  ANSWER = 'ANSWER',
  REJECT = 'REJECT'
}
