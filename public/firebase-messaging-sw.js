// 1. 최신 v9 이상 버전의 라이브러리를 모듈 형태로 불러옵니다.
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js",
);

// 2. 파이어베이스 초기화
const firebaseConfig = {
  apiKey: "AIzaSyD5WkdKbsGc1SEuWjxPAyYq7Pu1RANxjsk",
  authDomain: "cocod-8c97a.firebaseapp.com",
  projectId: "cocod-8c97a",
  storageBucket: "cocod-8c97a.firebasestorage.app",
  messagingSenderId: "1024531429157",
  appId: "1:1024531429157:web:d9b37f72a3aba2f71e8ccc",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// 4. 백그라운드 푸시 알림 수신 및 사운드/진동 처리
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] 최신 FCM v1 알림 수신:", payload);
});
