import { useState } from "react";
import { Outlet } from "react-router-dom";

const KioskLayout = () => {
  const [title, setTitle] = useState("마실이 키오스크");
  return (
    <div className="flex items-center justify-center h-dvh w-dvw">
      <div className="flex h-full w-full max-w-[1600px]  flex-col bg-(--bg-primary)">
        <header className="w-full py-6 text-center text-[5vw] font-bold text-(--text-primary) ">
          {title}
        </header>
        <main className="w-full h-full">
          <Outlet context={{ setTitle }} />
        </main>
      </div>
    </div>
  );
};

export default KioskLayout;
