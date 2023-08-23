export const environment = {
  loginUrl: "",
  usersUrl: "",
  contactRequestsUrl: "",
  rtcUrl: "",

  pusher: {
    key: "",
    cluster: "",
    authUrl: ""
  },

  rtc: {
    servers: {
      iceServers: [
        {
          urls: ['', '']
        }
      ]
    },
    constraints: {
      video: {
        width: { min:640, ideal:1920, max:1920 },
        height: { min:480, ideal:1080, max:1080 },
      },
      audio: true
    }
  }
};
