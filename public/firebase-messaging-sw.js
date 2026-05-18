importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js",
);

// 아래 설정값(apiKey 등)은 본인의 Firebase 콘솔 설정값으로 꼭 채워넣어야 실전 알림이 작동합니다!
const firebaseConfig = {
  apiKey: "AIzaSyD5WkdKbsGc1SEuWjxPAyYq7Pu1RANxjsk",
  authDomain: "cocod-8c97a.firebaseapp.com",
  projectId: "cocod-8c97a",
  storageBucket: "cocod-8c97a.firebasestorage.app",
  messagingSenderId: "1024531429157",
  appId: "1:1024531429157:web:3733a009612717061e8ccc",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// 백그라운드 메시지 처리
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] 메시지 수신:", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/ICON2.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
