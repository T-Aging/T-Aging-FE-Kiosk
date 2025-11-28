import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "./components/layout/KioskLayout";
import SplashScreen from "./pages/SplashScreen";
import MembershipCheck from "./pages/MembershipCheck";
import VerificationMethod from "./pages/VerificationMethod";
import PhoneInput from "./pages/PhoneInput";
import QRScan from "./pages/QRScan";
import RecentOrders from "./pages/RecentOrders";
import ConversationalOrder from "./pages/ConversationalOrder";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderComplete from "./pages/OrderComplete";
import PWAInstallUI from "@/components/PWAInstallUI";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <SplashScreen /> },
      { path: "membership", element: <MembershipCheck /> },
      { path: "membership/verify-method", element: <VerificationMethod /> },
      { path: "membership/phone", element: <PhoneInput /> },
      { path: "membership/qr", element: <QRScan /> },
      { path: "recent-orders", element: <RecentOrders /> },
      { path: "order", element: <ConversationalOrder /> },
      { path: "order/confirmation", element: <OrderConfirmation /> },
      { path: "order/complete", element: <OrderComplete /> },
    ],
  },
]);

const queryClient = new QueryClient();

function App() {
  return (
    <>
      <PWAInstallUI />

      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </>
  );
}

export default App;
