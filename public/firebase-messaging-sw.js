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

// ⭐️ [수정 핵심] 5. 푸시 알림을 사용자가 클릭했을 때의 동작 정의
self.addEventListener("notificationclick", (event) => {
  console.log("[Service Worker] 알림 클릭됨:", event);

  // 알림 팝업창을 닫습니다.
  event.notification.close();

  // 서버에서 보낸 방 주소(data.url)를 읽어옵니다. 없으면 메인 홈 주소로 잡습니다.
  const targetUrl = event.notification.data?.url || "https://taptapq.com";

  // 현재 유저의 브라우저 탭들 중 해당 주소가 이미 열려있는지 확인 후 처리합니다.
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // 1) 이미 같은 주소로 열려있는 탭이 있다면 그 탭으로 강제 이동(포커스)시킵니다.
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url === targetUrl && "focus" in client) {
            return client.focus();
          }
        }
        // 2) 만약 열려있는 탭이 없다면 새 탭을 하나 까서 해당 방 주소로 바로 이동시킵니다.
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      }),
  );
});
