import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  onBackgroundMessage,
  getMessaging,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging.js";

// 파이어베이스 초기화
const firebaseConfig = {
  apiKey: "AIzaSyD5WkdKbsGc1SEuWjxPAyYq7Pu1RANxjsk",
  authDomain: "cocod-8c97a.firebaseapp.com",
  projectId: "cocod-8c97a",
  storageBucket: "cocod-8c97a.firebasestorage.app",
  messagingSenderId: "1024531429157",
  appId: "1:1024531429157:web:d9b37f72a3aba2f71e8ccc",
  measurementId: "G-MV19YEZ3HE",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// 백그라운드 푸시 알림 수신 대기
onBackgroundMessage(messaging, (payload) => {
  const notificationTitle = payload.notification?.title || "TAPTAPQR";
  const notificationOptions = {
    body: payload.notification?.body || "PHOTO",
    icon: "/icon-192x192.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
