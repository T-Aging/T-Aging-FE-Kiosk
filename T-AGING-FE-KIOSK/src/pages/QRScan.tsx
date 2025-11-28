import { useEffect, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import QrScanner from "qr-scanner";
import masil from "@/assets/images/masil.png";

const QRScan = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const navigate = useNavigate();
  const { setTitle } = useOutletContext<{ setTitle: (v: string) => void }>();

  useEffect(() => {
    setTitle("QR 스캔");
  }, [setTitle]);

  useEffect(() => {
    if (!videoRef.current) return;

    // QR Scanner 초기화
    scannerRef.current = new QrScanner(
      videoRef.current,
      (result) => {
        console.log("QR 결과:", result);
        navigate("/recent-orders");
      },
      {
        highlightScanRegion: true,
        highlightCodeOutline: true,
        returnDetailedScanResult: true,
        maxScansPerSecond: 10,
      },
    );

    // 카메라 시작
    scannerRef.current.start().catch((err) => {
      console.error("카메라 접근 오류:", err);
    });

    return () => {
      scannerRef.current?.stop();
    };
  });

  return (
    <div className="flex h-full w-full flex-col bg-(--bg-primary)">
      <div className="flex flex-1 flex-col items-center pt-[8vh]">
        {/* 상단 영역 */}
        <div className="mb-[6vh] flex items-center gap-[3vw]">
          <img src={masil} alt="masil logo" className="h-auto w-[22vw]" />
          <div className="rounded-2xl border border-(--border-light) bg-white px-[6vw] py-[2vh] text-[5vw] text-(--text-primary) shadow-md">
            QR 코드를 보여주세요!
          </div>
        </div>

        {/* QR 스캔 박스 */}
        <div className="mb-[4vh] flex h-[45vw] w-[45vw] items-center justify-center overflow-hidden rounded-2xl border-4 border-(--border-light) bg-black shadow-md">
          <video
            ref={videoRef}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        <p className="mt-[1vh] text-center text-[3vw] text-(--text-secondary)">
          휴대폰에 있는 QR 코드를 <br />
          스캔 영역 가까이 대주세요
        </p>

        <button
          onClick={() => navigate("/recent-orders")}
          className="mt-[4vh] rounded-xl bg-(--color-primary) px-[8vw] py-[2vh] text-[5vw] text-(--text-inverse) shadow-md active:scale-95"
        >
          스캔 완료
        </button>
      </div>

      {/* Footer */}
      <div className="flex h-[10vh] w-full items-center justify-between border-t border-(--border-light) bg-white px-[4vw]">
        <button
          onClick={() => navigate(-1)}
          className="text-[5vw] text-(--text-primary)"
        >
          ← 이전
        </button>

        <button className="flex items-center justify-center rounded-xl bg-(--accent) px-[4vw] py-[2vh] text-[5vw] text-(--text-inverse) shadow-sm">
          직원 호출
        </button>
      </div>
    </div>
  );
};

export default QRScan;
