import { usePWAInstall } from "@/hooks/usePWAInstall";

const PWAInstallUI = () => {
  const { showIOSBanner, showAndroidButton, installPWA } = usePWAInstall();

  return (
    <>
      {/* ----------------------------- */}
      {/* iOS 설치 안내 배너 (Safari 전용) */}
      {/* ----------------------------- */}
      {showIOSBanner && (
        <div className="fixed bottom-4 left-1/2 z-9999 w-[85vw] -translate-x-1/2 rounded-xl border border-gray-300 bg-white p-4 text-center shadow-md">
          <p className="text-[4vw] leading-snug">
            이 앱을 설치하려면
            <br />
            Safari에서 <b>공유 버튼 → “홈 화면에 추가”</b>를 눌러주세요.
          </p>
        </div>
      )}

      {/* -------------------------------------- */}
      {/* Android Chrome 환경에서의 “앱 설치하기” 버튼 */}
      {/* -------------------------------------- */}
      {showAndroidButton && (
        <button
          onClick={installPWA}
          className="fixed bottom-4 left-1/2 z-9999 -translate-x-1/2 rounded-xl bg-(--color-primary) px-6 py-3 text-[4vw] text-white shadow-xl"
        >
          앱 설치하기
        </button>
      )}
    </>
  );
};

export default PWAInstallUI;
