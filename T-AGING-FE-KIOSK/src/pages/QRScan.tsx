import { useEffect, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import QrScanner from "qr-scanner";
import masil from "@/assets/images/masil.png";
import { useTTS } from "@/hooks/useTTS";
import { useKioskStore } from "@/store/useWebSocketStore";

// QRScan 내부에서만 사용할 로컬 타입
interface LocalQrLoginRequest {
  type: "qr_login";
  data: {
    qrCode: string;
  };
}

// QrScanner 결과 타입 (공식 구조 기반)
interface LocalScanResult {
  data: string;
  cornerPoints?: Array<{ x: number; y: number }>;
}

const QRScan = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const spokenRef = useRef(false);

  const navigate = useNavigate();
  const { setTitle } = useOutletContext<{ setTitle: (v: string) => void }>();

  const { playTTS, stopTTS } = useTTS();
  const connect = useKioskStore((s) => s.connect);
  const sendMessage = useKioskStore((s) => s.sendMessage);
  const lastReply = useKioskStore((s) => s.lastReply);

  useEffect(() => {
    connect();
    setTitle("QR 스캔");

    if (!spokenRef.current) {
      spokenRef.current = true;
      playTTS("모바일 앱의 QR 코드를 스캔해주세요.");
    }
  }, [setTitle, playTTS, connect]);

  // QR 인식 성공
  const handleQRDetected = (result: LocalScanResult) => {
    console.log("QR 결과:", result.data);

    stopTTS();

    const msg: LocalQrLoginRequest = {
      type: "qr_login",
      data: { qrCode: result.data },
    };

    sendMessage(msg as never); // 충돌 방지용
  };

  // WebSocket 응답 처리
  useEffect(() => {
    if (!lastReply) return;

    if ("login_success" in lastReply) {
      if (lastReply.login_success) {
        navigate("/recent-orders");
      } else {
        alert("로그인 실패: QR 정보를 확인해주세요.");
      }
    }
  }, [lastReply, navigate]);

  useEffect(() => {
    if (!videoRef.current) return;

    scannerRef.current = new QrScanner(
      videoRef.current,
      (result) => handleQRDetected(result as LocalScanResult),
      {
        highlightScanRegion: true,
        highlightCodeOutline: true,
        returnDetailedScanResult: true,
        maxScansPerSecond: 10,
      },
    );

    scannerRef.current.start().catch(console.error);

    return () => {
      scannerRef.current?.stop();
      stopTTS();
    };
  });

  return (
    <div className="flex h-full w-full flex-col bg-(--bg-primary)">
      <div className="flex flex-1 flex-col items-center pt-[8vh]">
        <div className="mb-[6vh] flex items-center gap-[3vw]">
          <img src={masil} alt="masil logo" className="h-auto w-[22vw]" />
          <div className="rounded-2xl border bg-white px-[6vw] py-[2vh] text-[5vw] shadow-md">
            QR 코드를 보여주세요!
          </div>
        </div>

        <div className="mb-[4vh] flex h-[45vw] w-[45vw] items-center justify-center overflow-hidden rounded-2xl border-4 bg-black shadow-md">
          <video
            ref={videoRef}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        <p className="mt-[1vh] text-center text-[3vw] text-(--text-secondary)">
          QR 코드를 스캔 영역에 가까이 대주세요
        </p>
      </div>
    </div>
  );
};

export default QRScan;
