import { useState } from "react";
import { Outlet } from "react-router-dom";

const KioskLayout = () => {
  const [title, setTitle] = useState("마실이 키오스크");

  return (
    <div className="flex h-dvh w-dvw items-center justify-center overflow-hidden">
      <div className="flex h-full w-full flex-col bg-(--bg-primary)">
        {/* HEADER */}
        <header className="w-full py-6 text-center text-[5vw] font-bold text-(--text-primary)">
          {title}
        </header>

        {/* MAIN */}
        <main className="w-full flex-1 overflow-hidden">
          <Outlet context={{ setTitle }} />
        </main>
      </div>
    </div>
  );
};

export default KioskLayout;
