export const environment = {
  loginUrl: "https://video-chat-backend-5c5f.onrender.com/api/auth/login",
  usersUrl: "https://video-chat-backend-5c5f.onrender.com/api/users",
  contactRequestsUrl: "https://video-chat-backend-5c5f.onrender.com/api/contact-requests",
  rtcUrl: "https://video-chat-backend-5c5f.onrender.com/api/rtc",
  chatUrl: "https://video-chat-backend-5c5f.onrender.com/api/chat",

  pusher: {
    key: "f8cd383efe2beeca7536",
    cluster: "eu",
    authUrl: "https://video-chat-backend-5c5f.onrender.com/api/auth/pusher"
  },

  rtc: {
    iceServers:  ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
  }
};
