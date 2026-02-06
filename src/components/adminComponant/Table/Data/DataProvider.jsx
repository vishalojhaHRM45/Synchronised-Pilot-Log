import React, { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { adminService } from "@/services";

const DataProvider = ({ children }) => {
  const [adminData, setAdminData] = useState(null);
  const [filterOptions, setFilterOptions] = useState(null);
  const [loadingAdmin, setLoadingAdmin] = useState(true);
  const [errorAdmin, setErrorAdmin] = useState(null);
  const [showPilotData, setShowPilotData] = useState(true);
  const [currentLastDays, setCurrentLastDays] = useState(28);
  const [currentPage, setCurrentPage] = useState(1);

  // Dynamic filter states
  const [selectedFilters, setSelectedFilters] = useState({
    rejectionType: null,
    tailNumber: null,
    flightNumber: null,
    pilot: null,
    entryBy: null,
  });

  const refetchAdminData = useCallback(async (lastDays, pageNo = 1, filters = null) => {
    setLoadingAdmin(true);
    setErrorAdmin(null);
    setCurrentLastDays(lastDays);
    setCurrentPage(pageNo);

    // Update selected filters if provided
    if (filters) {
      setSelectedFilters(filters);
    }

    try {
      const filtersToUse = filters || selectedFilters;
      const response = await adminService.getAdminFlights(
        lastDays,
        pageNo,
        filtersToUse.rejectionType,
        filtersToUse.tailNumber,
        filtersToUse.flightNumber,
        filtersToUse.pilot,
        filtersToUse.entryBy
      );
      setAdminData(response.AdminFlights || []);
    } catch (err) {
      console.error("Failed to fetch admin flights:", err);
      setErrorAdmin(err.message || "Unknown error");
      toast.error(`Failed to load data for last ${lastDays} days`);
    } finally {
      setLoadingAdmin(false);
    }
  }, [selectedFilters]);

  const fetchFiltersOptions = useCallback(async (filters = {}) => {
    // Don't show loading state for filter options updates
    setErrorAdmin(null);
    try {
      const response = await adminService.getAdminFiltersOptions(
        filters.rejectionType || null,
        filters.tailNumber || null,
        filters.flightNumber || null,
        filters.pilot || null,
        filters.entryBy || null
      );

      const parsedFilters = response.AdminFilters ? {
        AvailableRejectionTypes: response.AdminFilters[0].AvailableRejectionTypes || null,
        DistinctFlightNumbers: response.AdminFilters[0].DistinctFlightNumbers || null,
        DistinctPilots: response.AdminFilters[0].DistinctPilots || null,
        DistinctTailNumbers: response.AdminFilters[0].DistinctTailNumbers || null,
        EntryBy: response.AdminFilters[0].EntryBy || null,
        Counts: response.AdminFilters[0].Counts || null,
      } : null;

      setFilterOptions(parsedFilters);
    } catch (err) {
      console.error("Failed to filter options:", err);
      setErrorAdmin(err.message);
    }
  }, []);

  useEffect(() => {
    refetchAdminData(28, 1);
    fetchFiltersOptions();
  }, [refetchAdminData, fetchFiltersOptions]);

  const handleTogglePilotData = () => {
    setShowPilotData((prev) => !prev);
  };

  const filteredData = useMemo(() => {
    if (loadingAdmin || !adminData || !adminData || !Array.isArray(adminData)) return [];

    return adminData?.map((adminItem) => {
      const adminEntry = {
        SNO: adminItem.SNo,
        copilotName: adminItem.CopilotName,
        PICpilotName: adminItem.PicName,
        flightDate: adminItem.FlightDate,
        flightNumber: adminItem.FlightNumber,
        tailNumber: adminItem.TailNumber,
        origin: adminItem.Origin,
        destination: adminItem.Destination,
        bestChocksOff: adminItem.ChocksOff,
        bestChocksOn: adminItem.ChocksOn,
        bestTakeoff: adminItem.Takeoff,
        bestTouchdown: adminItem.Touchdown,
        picId: adminItem.PicId,
        picName: adminItem.PicName,
        copilotId: adminItem.CopilotId,
        takeoffPilotId: adminItem.OriginalTakeoffPilotId,
        takeoffPilotName: adminItem.OriginalTakeoffPilotName,
        landingPilotId: adminItem.OriginalLandingPilotId,
        landingPilotName: adminItem.OriginalLandingPilotName,
        remarks: adminItem.Remarks || "-",
        comments: adminItem.RejectionReason || "-",
        TechLogURL: adminItem.TechLogURL || null,
        DayStatus: adminItem.DayStatus || "",
        ArrivalTime: adminItem.ArrivalTime || "",
        DepatureTime: adminItem.DepatureTime || "",
        RejectionType: adminItem.RejectionType || "",
        submissionId: adminItem.SubmissionId,

        MM: adminItem.MM || "",
        CM: adminItem.CM || "",
        Log: adminItem.Log || "",
        Acars: adminItem.Acars || "",

        P1Reason: adminItem.P1Reason,
        P1Remarks: adminItem.P1Remarks,
        P2Reason: adminItem.P2Reason,
        P2Remarks: adminItem.P2Remarks,

        FlightType: adminItem.FlightType || "",
        CopilotExerciseTypeId: adminItem.CopilotExerciseTypeId || "",
        PICExerciseTypeId: adminItem.PICExerciseTypeId || "",
      };
      const pilotEntry = {
        SNO: adminItem.SNo,
        copilotName: adminItem.CopilotName,
        PICpilotName: adminItem.PicName,
        flightDate: adminItem.FlightDate,
        flightNumber: adminItem.FlightNumber,
        tailNumber: adminItem.TailNumber,
        origin: adminItem.Origin,
        destination: adminItem.Destination,
        bestChocksOff: adminItem.ChocksOff,
        bestChocksOn: adminItem.ChocksOn,
        bestTakeoff: adminItem.Takeoff,
        bestTouchdown: adminItem.Touchdown,
        picId: adminItem.PicId,
        picName: adminItem.PicName,
        copilotId: adminItem.CopilotId,
        takeoffPilotId: adminItem.SubmittedTakeoffPilotId,
        takeoffPilotName: adminItem.SubmittedTakeoffPilotName,
        landingPilotId: adminItem.SubmittedLandingPilotId,
        landingPilotName: adminItem.SubmittedLandingPilotName,
        remarks: adminItem.Remarks || "-",
        comments: adminItem.RejectionReason || "-",
        TechLogURL: adminItem.TechLogURL || null,
        DayStatus: adminItem.DayStatus || "",
        ArrivalTime: adminItem.ArrivalTime || "",
        DepatureTime: adminItem.DepatureTime || "",
        RejectionType: adminItem.RejectionType || "",
        submissionId: adminItem.SubmissionId,

        MM: adminItem.MM || "",
        CM: adminItem.CM || "",
        Log: adminItem.Log || "",
        Acars: adminItem.Acars || "",

        P1Reason: adminItem.P1Reason,
        P1Remarks: adminItem.P1Remarks,
        P2Reason: adminItem.P2Reason,
        P2Remarks: adminItem.P2Remarks,

        FlightType: adminItem.FlightType || "",
        CopilotExerciseTypeId: adminItem.CopilotExerciseTypeId || "",
        PICExerciseTypeId: adminItem.PICExerciseTypeId || "",
      };

      return {
        submissionId: adminItem.SubmissionId,
        indicatorColor: adminItem.IndicatorColor,
        isMatch: adminItem.isMatch,
        entries: [adminEntry, pilotEntry],
      };
    });
  }, [adminData, loadingAdmin]);

  if (loadingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-GraySecondaryLight">
            Loading{" "}
            {currentLastDays === 1
              ? "Yesterday's"
              : `last ${currentLastDays} days'`}{" "}
            flights...
          </p>
        </div>
      </div>
    );
  }

  if (errorAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold mb-2">Error Loading Data</p>
          <p>{errorAdmin}</p>
          <button
            onClick={() => refetchAdminData(currentLastDays)}
            className="mt-4 px-4 py-2 bg-primary text-surfaceBase rounded hover:bg-primary"
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
        currentLastDays,
        currentPage,
        filterOptions,
        selectedFilters,
        setSelectedFilters,
        fetchFiltersOptions,
      })}
    </div>
  );
};

export default React.memo(DataProvider);
