// 1. 서비스 워커 전용 파이어베이스 v10 라이브러리 로드 (Compat 버전)
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js",
);

// 2. 파이어베이스 초기화
const firebaseConfig = {
  apiKey: "AIzaSyD5WkdKbsGc1SEuWjxPAyYq7Pu1RANxjsk",
  authDomain: "cocod-8c97a.firebaseapp.com",
  projectId: "cocod-8c97a",
  storageBucket: "cocod-8c97a.firebasestorage.app",
  messagingSenderId: "1024531429157",
  appId: "1:1024531429157:web:d9b37f72a3aba2f71e8ccc",
  measurementId: "G-MV19YEZ3HE",
};

firebase.initializeApp(firebaseConfig);

// 3. 메시징 객체 가져오기
const messaging = firebase.messaging();

// 4. 백그라운드 푸시 알림 수신 대기
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] 백그라운드 알림 수신:", payload);

  const notificationTitle = payload.notification?.title || "TAPTAPQR";
  const notificationOptions = {
    body: payload.notification?.body || "PHOTO",
    icon: "/icon-192x192.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
