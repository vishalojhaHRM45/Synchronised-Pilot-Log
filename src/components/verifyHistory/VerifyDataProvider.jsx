import React, { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { adminService } from "@/services";

const VerifyDataProvider = ({ children }) => {
  const [adminData, setAdminData] = useState(null);
  const [loadingAdmin, setLoadingAdmin] = useState(true);
  const [errorAdmin, setErrorAdmin] = useState(null);
  const [showPilotData, setShowPilotData] = useState(true);


  const refetchAdminData = useCallback(async () => {
    setLoadingAdmin(true);
    setErrorAdmin(null);

    try {
      const response = await adminService.getAdminHistory();
      setAdminData(response || []);
    } catch (err) {
      console.error("Failed to Archive Data:", err.message);
      setErrorAdmin(err.message || "Unknown error");
      toast.error("Failed to load data");
    } finally {
      setLoadingAdmin(false);
    }
  }, []);

  useEffect(() => {
    refetchAdminData();
  }, [refetchAdminData]);

  const handleTogglePilotData = () => setShowPilotData((prev) => !prev);

  const filteredData = useMemo(() => {
    if (loadingAdmin || !adminData || !adminData || !Array.isArray(adminData)) return [];

    return adminData?.map((adminItem) => {
      const baseEntry = {
        SNO: adminItem.SNo,
        copilotId: adminItem.CopilotId,
        copilotName: adminItem.CopilotName,
        picId: adminItem.PicId,
        picName: adminItem.PicName,

        flightDate: adminItem.FlightDate,
        flightNumber: adminItem.FlightNumber,
        FlightType: adminItem.FlightType || "",
        tailNumber: adminItem.TailNumber,


        bestChocksOff: adminItem.ChocksOff,
        bestChocksOn: adminItem.ChocksOn,
        bestTakeoff: adminItem.Takeoff,
        bestTouchdown: adminItem.Touchdown,

        origin: adminItem.Origin,
        remarks: adminItem.Remarks,
        TechLogURL: adminItem.TechLogURL,
        comments: adminItem.RejectionReason,
        destination: adminItem.Destination,

        DayStatus: adminItem.DayStatus,
        ArrivalTime: adminItem.ArrivalTime,
        DepatureTime: adminItem.DepatureTime,
        submissionId: adminItem.SubmissionId,
        RejectionType: adminItem.RejectionType,

        takeoffPilotId: adminItem.SubmittedTakeoffPilotId,
        takeoffPilotName: adminItem.SubmittedTakeoffPilotName,
        landingPilotId: adminItem.SubmittedLandingPilotId,
        landingPilotName: adminItem.SubmittedLandingPilotName,

        P1Reason: adminItem.P1Reason,
        P1Remarks: adminItem.P1Remarks,
        P2Reason: adminItem.P2Reason,
        P2Remarks: adminItem.P2Remarks,

        CopilotExerciseTypeId: adminItem.CopilotExerciseTypeId || "",
        PICExerciseTypeId: adminItem.PICExerciseTypeId || "",
      };

      return {
        submissionId: adminItem.SubmissionId,
        indicatorColor: adminItem.IndicatorColor,
        isMatch: adminItem.CurrentStatus !== "ADMIN_REJECT",
        entries: [baseEntry, baseEntry]
      };
    });
  }, [adminData, loadingAdmin]);

  if (loadingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (errorAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">Error Loading Data</p>
          <p>{errorAdmin}</p>
          <button
            onClick={refetchAdminData}
            className="mt-4 px-4 py-2 bg-primary text-surfaceBase rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {children({
        filteredData,
        handleTogglePilotData,
        showPilotData,
        refetchAdminData,
        isLoading: loadingAdmin,
      })}
    </div>
  );
};

export default React.memo(VerifyDataProvider);
