import React, { useEffect } from "react";
import { QrReader } from "react-qr-reader";
import { useNavigate, useOutletContext } from "react-router-dom";
import masil from "@/assets/images/masil.png";

type QRResult = {
  getText: () => string;
};
const QRScan = () => {
  const navigate = useNavigate();
  const { setTitle } = useOutletContext<{ setTitle: (v: string) => void }>();

  useEffect(() => {
    setTitle("QR 스캔");
  }, [setTitle]);

  const handleScanComplete = () => {
    navigate("/recent-orders");
  };

  const handleResult = (result: unknown) => {
    const r = result as QRResult | null;

    if (r?.getText()) {
      navigate("/recent-orders");
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-(--bg-primary)">
      {/* CONTENT */}
      <div className="flex flex-1 flex-col items-center pt-[8vh]">
        {/* 상단 영역: 마실 이미지 + 말풍선 */}
        <div className="mb-[6vh] flex items-center gap-[3vw]">
          <img src={masil} alt="masil logo" className="h-auto w-[22vw]" />

          <div className="rounded-2xl border border-(--border-light) bg-white px-[6vw] py-[2vh] text-[5vw] text-(--text-primary) shadow-md">
            QR 코드를 보여주세요!
          </div>
        </div>

        {/* QR 스캔 박스 */}
        <div className="mb-[4vh] flex h-[45vw] w-[45vw] items-center justify-center overflow-hidden rounded-2xl border-4 border-(--border-light) bg-black shadow-md">
          <QrReader
            onResult={handleResult}
            scanDelay={300}
            constraints={{ facingMode: "environment" }}
            videoStyle={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        {/* 안내 문구 */}
        <p className="mt-[1vh] text-center text-[3vw] text-(--text-secondary)">
          휴대폰에 있는 QR 코드를 <br />
          스캔 영역 가까이 대주세요
        </p>

        {/* 스캔 완료 버튼 */}
        <button
          onClick={handleScanComplete}
          className="mt-[4vh] rounded-xl bg-(--color-primary) px-[8vw] py-[2vh] text-[5vw] text-(--text-inverse) shadow-md transition active:scale-95"
        >
          스캔 완료
        </button>
      </div>

      {/* FOOTER */}
      <div className="flex h-[10vh] w-full items-center justify-between border-t border-(--border-light) bg-white px-[4vw]">
        {/* ← 이전 */}
        <button
          onClick={() => navigate(-1)}
          className="text-[5vw] text-(--text-primary)"
        >
          ← 이전
        </button>

        {/* 직원 호출 */}
        <button className="flex items-center justify-center rounded-xl bg-(--accent) px-[4vw] py-[2vh] text-[5vw] text-(--text-inverse) shadow-sm">
          직원 호출
        </button>
      </div>
    </div>
  );
};

export default QRScan;
