export const environment = {
  loginUrl: "http://localhost:8080/api/auth/login",
  usersUrl: "http://localhost:8080/api/users",
  contactRequestsUrl: "http://localhost:8080/api/contact-requests",
  rtcUrl: "http://localhost:8080/api/rtc",
  chatUrl: "http://localhost:8080/api/chat",

  pusher: {
    key: "",
    cluster: "eu",
    authUrl: "http://localhost:8080/api/auth/pusher"
  },

  rtc: {
    iceServers:  ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
  }
};
