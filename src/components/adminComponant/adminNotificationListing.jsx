import React, { useState, useEffect, useRef } from "react";
import { Bell, X } from "lucide-react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { adminService } from "@/services";
import ConfirmPopup from "./Table/ConfirmPopup";
import TableComponent from "./Table/TableComponent";
import { markAsRead } from "@/app/features/notificationSlice";
import { useParams, useSearchParams } from 'react-router-dom';
import { notificationService } from "@/services/notificationServices";

const AdminNotificationListing = ({ notifications = [], adminFlights = [], fetchAdminFlights, RM_UserId }) => {
  const dispatch = useDispatch();
  const notificationRefs = useRef({});
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const [highlightedId, setHighlightedId] = useState(null);
  const [popupData, setPopupData] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [showApprovePopup, setShowApprovePopup] = useState(false);
  const [loadingFlights, setLoadingFlights] = useState({});

  useEffect(() => {
    const notificationId = id || searchParams.get('id');
    if (notificationId) {
      const numericId = parseInt(notificationId, 10);
      setHighlightedId(numericId);

      setTimeout(() => {
        const element = notificationRefs.current[numericId];
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 300);
    } else {
      setHighlightedId(null);
    }

    return () => {
      setHighlightedId(null);
    };
  }, [id, searchParams, notifications]);

  const openFlightDetails = async ({ SubmissionId, Id }) => {
    try {
      await notificationService.updateNotification(Id);
      dispatch(markAsRead(Id));
    } catch (error) {
      console.error("Update failed:", error);
    }

    if (!SubmissionId) return;
    const existingFlight = adminFlights?.find(f => f?.SubmissionId === SubmissionId);

    if (existingFlight) {
      processFlightData(existingFlight);
      return;
    }

    setPopupData(null);
    setLoadingFlights(prev => ({ ...prev, [Id]: true }));
    // toast.loading("Loading flight details...", { id: "loading" });

    try {
      const response = await fetchAdminFlights(SubmissionId);

      const raw = response?.AdminFlights?.[0] || response?.[0] || response;
      if (!raw || !raw.SubmissionId) throw new Error("Flight not found");
      processFlightData(raw);
      // toast.success("Flight loaded!", { id: "loading" });
    } catch (err) {
      toast.error("You have already submitted the data.");
    } finally {
      setLoadingFlights(prev => ({ ...prev, [Id]: false }));
    }
  };

  const processFlightData = (raw) => {
    const flightData = {
      submissionId: raw.SubmissionId,
      indicatorColor: raw.IndicatorColor || "#02d102",
      isMatch: raw.IsMatch || 0,
      entries: [
        {
          copilotName: raw.CopilotName || "",
          PICpilotName: raw.PicName || "",
          // flightDate: new Date(raw.FlightDate).toISOString().split("T")[0],
          flightDate: raw.FlightDate,
          flightNumber: raw.FlightNumber || "",
          tailNumber: raw.TailNumber || "",
          origin: raw.Origin || "",
          destination: raw.Destination || "",
          bestChocksOff: raw.ChocksOff || "",
          bestChocksOn: raw.ChocksOn || "",
          bestTakeoff: raw.Takeoff || "",
          bestTouchdown: raw.Touchdown || "",
          picId: raw.PicId || "",
          picName: raw.PicName || "",
          copilotId: raw.CopilotId || "",
          takeoffPilotId: raw.OriginalTakeoffPilotId || "",
          takeoffPilotName: raw.OriginalTakeoffPilotName || "",
          landingPilotId: raw.OriginalLandingPilotId || "",
          landingPilotName: raw.OriginalLandingPilotName || "",
          remarks: raw.Remarks || "-",
          comments: raw.RejectionReason || "-",
          TechLogURL: raw.TechLogURL || null,
          DayStatus: raw.DayStatus || "",
          ArrivalTime: raw.ArrivalTime || "",
          DepatureTime: raw.DepatureTime || "",
          RejectionType: raw.RejectionType || "",
          Acars: raw.Acars || "",
          MM: raw.MM || "",
          CM: raw.CM || "",
          Log: raw.Log || "",

          P1Reason: raw.P1Reason,
          P1Remarks: raw.P1Remarks,
          P2Reason: raw.P2Reason,
          P2Remarks: raw.P2Remarks,
        },
        {
          copilotName: raw.CopilotName || "",
          PICpilotName: raw.PicName || "",
          // flightDate: new Date(raw.FlightDate).toISOString().split("T")[0],
          flightDate: raw.FlightDate,
          flightNumber: raw.FlightNumber || "",
          tailNumber: raw.TailNumber || "",
          origin: raw.Origin || "",
          destination: raw.Destination || "",
          bestChocksOff: raw.ChocksOff || "",
          bestChocksOn: raw.ChocksOn || "",
          bestTakeoff: raw.Takeoff || "",
          bestTouchdown: raw.Touchdown || "",
          picId: raw.PicId || "",
          picName: raw.PicName || "",
          copilotId: raw.CopilotId || "",
          takeoffPilotId: raw.SubmittedTakeoffPilotId || "",
          takeoffPilotName: raw.SubmittedTakeoffPilotName || "",
          landingPilotId: raw.SubmittedLandingPilotId || "",
          landingPilotName: raw.SubmittedLandingPilotName || "",
          remarks: raw.Remarks || "-",
          comments: raw.RejectionReason || "-",
          TechLogURL: raw.TechLogURL || null,
          DayStatus: raw.DayStatus || "",
          ArrivalTime: raw.ArrivalTime || "",
          DepatureTime: raw.DepatureTime || "",
          RejectionType: raw.RejectionType || "",
          Acars: raw.Acars || "",
          MM: raw.MM || "",
          CM: raw.CM || "",
          Log: raw.Log || "",

          P1Reason: raw.P1Reason,
          P1Remarks: raw.P1Remarks,
          P2Reason: raw.P2Reason,
          P2Remarks: raw.P2Remarks,
        },
      ],
    };

    setPopupData([flightData]);
    setSelectedData(flightData);
  };

  const handleApprove = async (values) => {
    try {
      const payload = {
        ...values,
        // RM_UserId,
        AdminAction: "APPROVE",
      };

      await adminService.submitAdminFlights(payload);

      toast.success("Flight approved successfully!");
      setShowApprovePopup(false);
      setPopupData(null);
      setSelectedData(null);
    } catch (err) {
      toast.error("Approval failed");
    }
  };

  const handleApproveClick = () => {
    if (!selectedData) return toast.error("No flight data selected");
    setPopupData(null);
    setShowApprovePopup(true);
  };

  const handleMarkAllRead = async () => {
    try {
      const unreadIds = notifications
        ?.filter(n => !n.Isread)
        ?.map(n => n.Id);

      if (unreadIds.length === 0) return;
      await notificationService.updateNotification(unreadIds);
      dispatch(markAsRead(unreadIds));

    } catch (error) {
      console.error("Mark all failed:", error);
    }
  };

  return (
    <>
      {notifications?.length > 0 && (
        <div className="flex justify-end px-4 pb-2">
          <span
            onClick={handleMarkAllRead}
            className="text-primary Text text-sm font-medium cursor-pointer hover:underline"
          >
            Mark All Read
          </span>
        </div>
      )}

      <div className="space-y-4 px-4">
        {notifications.length === 0 ? (
          <div className="text-center py-16 text-textPrimary">
            <Bell className="w-16 h-16 mx-auto mb-3 opacity-40" />
            <p className="text-lg font-medium tracking-wide">
              No new notifications
            </p>
          </div>
        ) : (
          notifications.map((notif) => {
            const isHighlighted = highlightedId === notif?.Id;
            const isLoading = loadingFlights[notif.Id];

            return (
              <div
                key={notif.Id}
                ref={(elm) => (notificationRefs.current[notif.Id] = elm)}
                onClick={() => openFlightDetails(notif)}
                className={`p-4 rounded-2xl shadow transition-all duration-500 cursor-pointer border backdrop-blur-xl 
                ${isHighlighted
                    ? 'bg-yellow-100 border-yellow-400 ring-2 ring-yellow-200'
                    : !notif.Isread
                      ? "bg-notificationBg border-emerald-300 hover:shadow-xl"
                      : "bg-backgroundLight border-gray-200 hover:shadow-lg"
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-md">
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-surfaceBase"></div>
                    ) : (
                      <Bell className="w-4 h-4 text-surfaceBase" />
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="text-textPrimary font-normal text-[13px] leading-snug">
                      {notif.NotificationMessage}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {popupData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={() => setPopupData(null)}>
          <div
            className="bg-backgroundLight rounded-xl shadow-2xl w-full max-w-[96vw] h-100 flex flex-col overflow-hidden border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="All-header-color font-bold text-primary p-5 flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                Verify & Approve Flight
              </h2>

              <button
                className="text-textPrimary cursor-pointer p-2 rounded-full"
                onClick={() => {
                  setPopupData(null);
                  setSelectedData(null);
                }}
              >
                <X size={28} />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6 bg-gray-200">
              <TableComponent
                data={popupData}
                showPilotData={true}
                selectedGroups={[]}
                setSelectedGroups={() => { }}
                setSelectedData={setSelectedData}
                hideCheckbox={true}
              />
            </div>

            <div className="p-5 bg-gray-200 border-t border-gray-300">
              <button
                onClick={handleApproveClick}
                className="cursor-pointer px-6 py-3 toggle-on text-surfaceBase font-semibold rounded-xl mx-auto block shadow-lg hover:bg-emerald-700 transition-transform hover:scale-[1.03]"
              >
                SUBMIT
              </button>
            </div>
          </div>
        </div>
      )}

      {showApprovePopup && selectedData && (
        <ConfirmPopup
          title="Flight Log"
          onConfirm={handleApprove}
          onCancel={() => setShowApprovePopup(false)}
          selectedData={selectedData}
        />
      )}
    </>
  );
};

export default AdminNotificationListing;