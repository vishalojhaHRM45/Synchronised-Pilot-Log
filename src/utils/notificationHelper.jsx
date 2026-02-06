import { useEffect } from "react";
import { store } from "@/app/store";
import { useNavigate } from "react-router-dom";
import { notificationService } from "@/services/notificationServices";

export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    // console.log("Browser notifications not supported");
    return false;
  }
  if (Notification.permission === "granted") return true;
  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
  return false;
}

export async function subscribeToPushNotifications() {
  const { RM_UserId } = store.getState().auth;

  try {
    const registration = await navigator.serviceWorker.ready;
    const vapidResponse = await notificationService.getSubscribeToPushNotifications();
    const { publicKey } = vapidResponse;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    });

    const subscriptionData = subscription.toJSON();
    const cleanedEndpoint = subscriptionData.endpoint.replace(/^https:\/\//, '');

    const payload = {
      // RM_UserId,
      subscription_data: {
        endpoint: cleanedEndpoint,
        expirationTime: subscriptionData.expirationTime,
        keys: subscriptionData.keys
      }
    };

    // const payload = {
    //   RM_UserId,
    //   subscription_data: subscription,
    // };
    await notificationService.postSubscribeNotification(payload);

    return subscription;
  } catch (error) {
    // console.error('Push subscription error:', error);
    return null;
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String?.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}


export function NotificationHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleMessage = (event) => {
        // console.log('[App] Received message from SW:', event.data);

        if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
          // console.log('[App] Navigating to:', event.data.url);
          navigate(event.data.url);
        }
      };

      navigator.serviceWorker.addEventListener('message', handleMessage);

      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }
  }, [navigate]);

  return null;
}