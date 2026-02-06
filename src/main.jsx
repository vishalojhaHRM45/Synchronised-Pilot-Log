import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { registerSW } from "virtual:pwa-register";
import { Provider } from "react-redux";
import { store } from "./app/store.js";
import { Toaster } from 'react-hot-toast';

const updateSW = registerSW({
  onNeedRefresh() {
    updateSW(true)
  },
  onOfflineReady() {
    console.log("App is ready to work offline");
  },
});

createRoot(document.getElementById("root")).render(

  <Provider store={store}>
    <App />
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1f2937',
          color: '#fff',
          fontSize: '16px',
          padding: '12px 20px',
        },
        success: {
          duration: 3000,
          style: {
            background: '#22c55e',
          },
        },
        error: {
          duration: 5000,
          style: {
            background: '#ef4444',
          },
        },
      }}
    />
  </Provider>

);
