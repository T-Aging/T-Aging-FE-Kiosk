import { Outlet } from "react-router-dom";

const KioskLayout = () => {
  return (
    <div className="flex justify-center h-dvh w-dvw ">
      <div className="flex h-full w-full max-w-[1600px]  flex-col bg-(--bg-primary)">
        <main className="w-full h-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default KioskLayout;
