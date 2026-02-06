import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeftIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { setNotifications } from "@/app/features/notificationSlice";
import { notificationService } from "@/services/notificationServices";
import NotificationListing from "@/components/pilotComponent/notificationListing";
import AdminNotificationListing from "@/components/adminComponant/adminNotificationListing";

const NotificationPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data } = useSelector((state) => state.notifications);
  const { RM_UserId, role } = useSelector((state) => state.auth);

  const [crewFlights, setCrewFlights] = useState([]);
  const [adminFlights, setAdminFlights] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const intervalRef = useRef(null);
  const isMountedRef = useRef(true);

  const fetchCrewFlights = useCallback(async (submissionId) => {
    try {
      // const response = await notificationService.getPilotCrewFlights(RM_UserId, submissionId);
      const response = await notificationService.getPilotCrewFlights(submissionId);
      if (isMountedRef.current) {
        setCrewFlights(prev => {
          const exists = prev.some(flight => flight.SubmissionId === submissionId);
          if (exists) return prev;
          return [...prev, ...(response?.CrewFlights || [])];
        });
      }
      return response;
    } catch (err) {
      console.error('Failed to Fetch Crew Flights', err);
      throw err;
    }
    // }, [RM_UserId]);
  }, []);

  const fetchAdminFlights = useCallback(async (submissionId) => {
    try {
      // const response = await notificationService.getAdminFlightBySubmissionId(RM_UserId, submissionId);
      const response = await notificationService.getAdminFlightBySubmissionId(submissionId);
      if (isMountedRef.current) {
        setAdminFlights(prev => {
          const exists = prev.some(flight => flight.SubmissionId === submissionId);
          if (exists) return prev;
          return [...prev, ...(response?.AdminFlights || [])];
        });
      }
      return response;
    } catch (err) {
      console.error('Failed to Fetch Admin Flights', err);
      throw err;
    }
    // }, [RM_UserId]);
  }, []);

  const fetchNotifications = useCallback(async (isInitial = false) => {
    if (!isMountedRef.current) {
      // if (!RM_UserId || !isMountedRef.current) {
      console.log("⚠️ Skipping fetch - User logged out or component unmounted");
      return;
    }

    try {
      if (isInitial) {
        setInitialLoading(true);
        setCrewFlights([]);
        setAdminFlights([]);
      }

      // const response = await notificationService.getNotification(RM_UserId);
      const response = await notificationService.getNotification();

      if (!isMountedRef.current) return;

      const notificationList = response?.NotificationList || [];
      dispatch(setNotifications(notificationList));
    } catch (err) {
      console.error('Failed to fetch Notifications', err);
    } finally {
      if (isInitial && isMountedRef.current) {
        setInitialLoading(false);
      }
    }
    // }, [RM_UserId, dispatch]);
  }, [dispatch]);

  useEffect(() => {
    // if (!RM_UserId) {
    //   console.log("⚠️ No RM_UserId - Skipping notification fetch");
    //   return;
    // }

    isMountedRef.current = true;
    fetchNotifications(true);

    const startPolling = () => {
      if (intervalRef.current) {
        console.log("⚠️ Polling already running, skipping start");
        return;
      }
      intervalRef.current = setInterval(() => {
        console.log("🔄 Polling - Fetching notifications...");
        fetchNotifications(false);
      }, 300000);
    };

    const stopPolling = () => {
      if (intervalRef.current) {
        console.log("🛑 Stopping notification polling");
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("🛑 Tab hidden - Notification polling stopped");
        stopPolling();
      } else {
        console.log("✅ Tab visible - Notification polling started");
        fetchNotifications(false);
        startPolling();
      }
    };

    startPolling();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMountedRef.current = false;
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  // }, [RM_UserId, fetchNotifications]);
  }, [fetchNotifications]);

  return (
    <>
      <div className="min-h-screen  bg-surfaceBase">

        <div className=" fixed top-0 left-0 right-0 bg-surfaceBase border-b border-gray-300 px-4 sm:px-6 lg:px-8 py-4 z-10">
          <div className=" relative flex items-center justify-center">

            <button
              onClick={() => navigate("/")}
              className="cursor-pointer absolute left-0 p-2 rounded-md text-textSecondary hover:bg-gray-100">
              <ArrowLeftIcon className="h-6 w-6" />
            </button>

            <h1 className="text-lg font-semibold text-textSecondary">
              Notifications
            </h1>
          </div>
        </div>

        <div className="mx-auto px-4 sm:px-6 lg:px-8 pt-15">
          <div className="relative py-3">
            {initialLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <>
                {role === 'pilot' ? (
                  <NotificationListing
                    RM_UserId={RM_UserId}
                    crewFlights={crewFlights}
                    notifications={data}
                    fetchCrewFlights={fetchCrewFlights}
                  />
                ) : (
                  <AdminNotificationListing
                    RM_UserId={RM_UserId}
                    adminFlights={adminFlights}
                    notifications={data}
                    fetchAdminFlights={fetchAdminFlights}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationPage;