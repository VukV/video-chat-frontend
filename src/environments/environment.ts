export const environment = {
  loginUrl: "",
  usersUrl: "",
  contactRequestsUrl: "",
  pusher: {
    key: "",
    cluster: "",
    authUrl: ""
  },
  rtc: {
    iceServers: [
      "", ""
    ],
    constraints: {
      video: {
        width: { min:640, ideal:1920, max:1920 },
        height: { min:480, ideal:1080, max:1080 },
      },
      audio: true
    }
  }
};
