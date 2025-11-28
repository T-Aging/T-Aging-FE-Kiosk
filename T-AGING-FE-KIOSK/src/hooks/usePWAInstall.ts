import { useEffect, useState } from "react";

// Android에서 PWA 설치 팝업을 띄워주는 beforeinstallprompt 이벤트 타입 확장
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const usePWAInstall = () => {
  // OS/브라우저 상태
  const [isIOS, setIsIOS] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isChrome, setIsChrome] = useState(false);

  // Android의 beforeinstallprompt 이벤트 저장
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(
    null
  );

  // UI 제어용 상태값
  const [showIOSBanner, setShowIOSBanner] = useState(false); // iOS 설치 안내 배너
  const [showAndroidButton, setShowAndroidButton] = useState(false); // Android 설치 버튼

  // ==========================
  // ① OS 및 브라우저 감지 (최초 실행)
  // ==========================
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();

    // iOS 기기 감지
    const ios = /iphone|ipad|ipod/.test(ua);

    // iOS Safari 감지 (사파리는 crios 또는 다른 브라우저 문자열이 없음)
    const safari =
      ios && !!navigator.userAgent.match(/safari/i) && !ua.includes("crios");

    // Android 감지
    const android = /android/.test(ua);

    // Android Chrome 감지 (단, 삼성 인터넷 제외)
    const chrome = /chrome/.test(ua) && !ua.includes("samsungbrowser");

    setIsIOS(ios);
    setIsSafari(safari);
    setIsAndroid(android);
    setIsChrome(chrome);

    // ---------- iOS 로직 ----------
    if (ios) {
      if (safari) {
        // iOS Safari에서만 PWA 설치 가능
        // 이미 설치된 상태면 navigator.standalone === true
        // 설치 안 되어 있으면 배너 표시
        if (!window.navigator.standalone) {
          setShowIOSBanner(true);
        }
      } else {
        // iOS이지만 Safari가 아닐 때 → PWA 설치 불가능
        alert("이 앱을 설치하려면 Safari 브라우저로 열어주세요!");
      }
    }

    // ---------- Android 로직 ----------
    if (android && chrome) {
      // Chrome이면 설치 가능한 환경이므로 버튼을 나중에 표시할 수 있게 준비
      setShowAndroidButton(false);
    } else if (android && !chrome) {
      // Android 다른 브라우저 → 설치 불가
      alert("앱 설치를 위해 Chrome 브라우저로 열어주세요!");
    }
  }, []);

  // ====================================
  // ② Android beforeinstallprompt 이벤트 감지
  // ====================================
  useEffect(() => {
    const handler = (e: Event) => {
      // 기본 설치 UI 막기
      e.preventDefault();
      // 이벤트 저장 (나중에 installPWA() 호출 시 사용)
      setInstallPrompt(e as InstallPromptEvent);
      // "앱 설치" 버튼 노출
      setShowAndroidButton(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // ==========================
  // ③ Android 설치 실행 함수
  // ==========================
  const installPWA = async () => {
    if (!installPrompt) return;

    // 설치 다이얼로그 띄움
    installPrompt.prompt();

    const choice = await installPrompt.userChoice;

    if (choice.outcome === "accepted") {
      console.log("PWA 설치 완료");
    } else {
      console.log("사용자가 설치를 취소했습니다");
    }
  };

  return {
    isIOS,
    isSafari,
    isAndroid,
    isChrome,
    showIOSBanner,
    showAndroidButton,
    installPWA,
  };
};
