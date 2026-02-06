import { useEffect } from "react";

import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Plane, LogOut, CircleUserRound, Bell } from "lucide-react";

import { logout } from "../../app/features/authSlice";
import CustomDropdown from "./../common/CustomDropdown";
import { authService } from "../../services/authServices";
import { setNotifications } from "@/app/features/notificationSlice";
import { notificationService } from "@/services/notificationServices";


const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { EgcaId, name, role } = useSelector((state) => state.auth);
  const { data } = useSelector((state) => state.notifications);
  const unreadCount = data?.filter(n => !n.Isread)?.length || 0;

  const fetchHeaderNotifications = async () => {
    try {
      // if (!RM_UserId) return;

      // const response = await notificationService.getNotification(RM_UserId);
      const response = await notificationService.getNotification();
      const list = response?.NotificationList || [];

      dispatch(setNotifications(list));
    } catch (err) {
      console.log("Header Notification Fetch Error:", err);
    }
  };

  useEffect(() => {
    // if (RM_UserId) {
    fetchHeaderNotifications();
  }, []);
  // }, [RM_UserId]);

  const unSubscribePost = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        console.log("No existing subscription found.");
        return null;
      }

      await subscription.unsubscribe();

      const payload = { subscription_data: subscription, };
      await notificationService.postUnSubscription(payload);

      console.log("Unsubscribed successfully");
      return subscription;
    } catch (error) {
      console.error('Push unsubscribe error:', error);
      return null;
    }
  }

  const handleForceLogout = async () => {
    try {
      const highestId = window.setTimeout(() => { }, 0);
      for (let i = 0; i < highestId; i++) {
        window.clearInterval(i);
      }
      await unSubscribePost();
      dispatch(logout());
      window.location.href = `${import.meta.env.VITE_API_BASE_URL}logout`;
      toast.success('logout Successfully');
      // window.location.href = authService.getLogOutUrl();
    } catch (err) {
      console.error("Logout failed:", err);
      dispatch(logout());
      window.location.replace("/");
    }
  };

  const handleSelect = (option) => {
    if (option.label === "Personal Details") {
      navigate("/personal-details");
    } else if (option.label === "Settings") {
      navigate("/settings");
    } else if (option.label === "Logout") {
      handleForceLogout();
    }
  };

  const handlePageReload = () => {
    const dashboardPath = role === "admin" ? "/admin/dashboard" : "/pilot/dashboard";
    if (window.location.pathname !== dashboardPath) {
      navigate(dashboardPath, { replace: true });
    } else {
      window.location.reload();
    }
  };

  const avatar = (
    role !== "admin" ?
      (
        <div className="w-8 h-8 flex items-center justify-center rounded-full text-slate-700 bg-white">
          {name?.trim()?.charAt(0)?.toUpperCase()}
        </div>
      ) : (
        <div className="bg-primary text-surfaceBase rounded-full w-7 h-7 flex items-center justify-center hover:bg-primary transition-colors">
          {<CircleUserRound size={18} />}
        </div>
      )
  );

  const nameIdDisplay = role !== "admin" ? EgcaId : name;

  return (
    <header className="sticky top-0 banner z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-7 py-3 flex justify-between items-center">

        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={handlePageReload}
        >
          <div className="Icon-Header">
            <Plane size={24} className="text-surfaceBase" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
            Synchronised Pilot Log (SPL)
          </h1>
        </div>

        <div className="flex items-center justify-center ">
          <CustomDropdown
            className="max-w-[150px] sm:max-w-42 shrink-0"
            buttonClassName="bg-gray-200 py-2 px-2 sm:px-3 rounded-full text-primary font-semibold hover:bg-gray-300 hover:text-blue-800 text-xs sm:text-base truncate"
            leftIcon={avatar}
            buttonText={nameIdDisplay}
            options={[
              ...(role !== "admin" ? [{ label: name, icon: CircleUserRound }] : []),
              { label: "Logout", icon: LogOut },
            ]}
            onSelect={handleSelect}
            menuAlign="right"
            showChevron={false}
            headerName={true}
          />

          <button
            onClick={() => navigate("/notification")}
            type="button"
            className="relative cursor-pointer ml-5"
          >
            <Bell size={26} className="text-primary" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-surfaceBase text-[9px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

        </div>
      </div>
    </header>
  );
};

export default Header;
