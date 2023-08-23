export const environment = {
  loginUrl: "http://localhost:8080/api/auth/login",
  usersUrl: "http://localhost:8080/api/users",
  contactRequestsUrl: "http://localhost:8080/api/contact-requests",
  pusher: {
    key: "",
    cluster: "eu",
    authUrl: "http://localhost:8080/api/auth/pusher"
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
