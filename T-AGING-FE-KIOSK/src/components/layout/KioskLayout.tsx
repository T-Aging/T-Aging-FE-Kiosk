import { Outlet } from "react-router-dom";

const KioskLayout = () => {
  return (
    <div className="flex h-dvh w-dvw justify-center bg-[var(--bg-primary)]">
      <div className="flex h-full w-full max-w-[1600px]  flex-col bg-white">
        <main className="h-full w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default KioskLayout;
