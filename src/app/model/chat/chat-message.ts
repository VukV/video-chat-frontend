export class ChatMessage {

  usernameFrom: string;
  usernameTo: string;
  data: string;

  constructor(usernameFrom: string, usernameTo: string, data: any) {
    this.usernameFrom = usernameFrom;
    this.usernameTo = usernameTo;
    this.data = data;
  }
}
