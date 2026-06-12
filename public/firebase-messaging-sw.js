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

// 3. 최신 FCM v1 규격과 호환되는 메시징 객체 생성
const messaging = firebase.messaging();

// 4. 백그라운드 푸시 알림 수신 및 사운드/진동 처리
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] 최신 FCM v1 알림 수신:", payload);

  // 백엔드가 보낸 fcm v1 페이로드 구조에 맞춰 데이터 추출
  const notificationTitle = payload.notification?.title || "TAPTAPQR";
  const notificationOptions = {
    body: payload.notification?.body || "PHOTO",
    icon: "/icon-192x192.png",

    // 기기 사운드 및 진동 강제 작동 설정
    sound: "default",
    vibrate: [200, 100, 200],

    // 알림 중복 및 덮어쓰기 설정
    tag: "taptapqr-photo-alert",
    renotify: true,
  };

  // 브라우저 시스템 상단 바에 알림 노출
  return self.registration.showNotification(
    notificationTitle,
    notificationOptions,
  );
});
