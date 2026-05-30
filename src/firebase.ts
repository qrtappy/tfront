import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
export { getToken } from "firebase/messaging";
// 아까 메모장에 복사한 내용을 여기에 붙여넣으세요
const firebaseConfig = {
  apiKey: "AIzaSyD5WkdKbsGc1SEuWjxPAyYq7Pu1RANxjsk",
  authDomain: "cocod-8c97a.firebaseapp.com",
  projectId: "cocod-8c97a",
  storageBucket: "cocod-8c97a.firebasestorage.app",
  messagingSenderId: "1024531429157",
  appId: "1:1024531429157:web:d9b37f72a3aba2f71e8ccc",
  measurementId: "G-MV19YEZ3HE",
};

// 파이어베이스 초기화
const app = initializeApp(firebaseConfig);

// 메시징 객체 내보내기 (브라우저 환경 체크)
export const messaging =
  typeof window !== "undefined" ? getMessaging(app) : null;

// 알림 권한 요청 함수 (팝업 유도만 수행)
export const requestPermission = async () => {
  if (typeof window !== "undefined" && "Notification" in window) {
    // 딱 이 한 줄이면 브라우저 알림창이 뜹니다.
    await Notification.requestPermission();
  }
};
