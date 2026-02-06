import React, { useEffect } from "react";
import "./index.css";
import { routes } from "./routes";
import { useRegisterSW } from "virtual:pwa-register/react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { NotificationHandler, requestNotificationPermission } from "./utils/notificationHelper";
import { fetchUser } from "./app/features/authSlice";
import { useDispatch, useSelector } from "react-redux";

function App() {
  const { needRefresh: [], offlineReady: [] } = useRegisterSW({
    onRegisteredSW(swUrl) {
      // console.log("Service Worker registered:", swUrl);

      requestNotificationPermission().then((hasPermission) => {
        if (hasPermission) {
          // console.log("Notification permission granted");
        } else {
          // console.log("User denied notification permission");
        }
      });
    },
    onRegisterError(error) {
      // console.error("SW registration error:", error);
    },
  });

  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchUser());
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-surfaceBase rounded-lg p-6 flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-GraySecondaryLight font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <NotificationHandler />
      <Routes>
        {routes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
      </Routes>
    </BrowserRouter>
  );
}

export default App;