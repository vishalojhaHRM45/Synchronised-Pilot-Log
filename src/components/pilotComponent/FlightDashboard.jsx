import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";

import Banner from "./Banner";
import TabFilters from "./TabFilters";
import FlightCard from "./FlightCard";
import { FlightLoadingGIF } from "@/assets";
import { pilotService } from "@/services";
import CustomPopup from "../common/Popups";
import { formatDateISO } from "@/utils/helper";
import { setCrewFlight } from "@/app/features/crewFlightSlice";

const FlightDashboard = () => {
  const dispatch = useDispatch();

  const intervalRef = useRef(null);
  const isMountedRef = useRef(true);
  const filtersRef = useRef({ status: "", LastDays: "28" });

  const { RM_UserId } = useSelector((state) => state.auth);
  const { data } = useSelector((state) => state.crewFlight);

  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    LastDays: "28",
  });

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const fetchCrewFlights = useCallback(async (isInitial = false) => {
    // if (!RM_UserId || !isMountedRef.current) {
    if (!isMountedRef.current) {
      console.log("⚠️ Skipping fetch - User logged out or component unmounted");
      return;
    }

    try {
      if (isInitial && isMountedRef.current) {
        setInitialLoading(true);
      }

      const currentFilters = filtersRef.current;
      // const response = await pilotService.getPilotCrewFlights(RM_UserId, currentFilters);
      const response = await pilotService.getPilotCrewFlights(currentFilters);

      if (isMountedRef.current) {
        dispatch(setCrewFlight(response?.CrewFlights || []));
      }
    } catch (err) {
      console.error('API FAILED:', err);
    } finally {
      if (isInitial && isMountedRef.current) {
        setInitialLoading(false);
      }
    }
    // }, [RM_UserId, dispatch]);
  }, [dispatch]);


  useEffect(() => {
    // if (!RM_UserId) {
    //   console.log("⚠️ No RM_UserId - Skipping flight fetch");
    //   return;
    // }

    isMountedRef.current = true;
    fetchCrewFlights(true);

    const startPolling = () => {
      if (intervalRef.current) {
        console.log("⚠️ Polling already running, skipping start");
        return;
      }

      console.log("✅ Starting flight polling (every 59 sec)");
      intervalRef.current = setInterval(() => {
        const now = new Date().toLocaleTimeString();
        console.log(`🔄 [${now}] Polling - Fetching crew flights...`);
        fetchCrewFlights(false);
      }, 59000);
    };

    const stopPolling = () => {
      if (intervalRef.current) {
        console.log("🛑 Stopping flight polling");
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };


    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log(" Tab hidden - Polling stopped");
        stopPolling();
      } else {
        console.log(" Tab visible - Polling started");
        fetchCrewFlights(false);
        startPolling();
      }
    };

    startPolling();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      const now = new Date().toLocaleTimeString();
      console.log(`🧹 [${now}] Cleanup: FlightDashboard UNMOUNTING`);
      isMountedRef.current = false;
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      console.log(` [${now}] Cleanup COMPLETE - All polling stopped`);
    };
    // }, [RM_UserId]);
  }, []);


  useEffect(() => {
    // if (filters.LastDays && RM_UserId && isMountedRef.current) {
    if (filters.LastDays && isMountedRef.current) {
      fetchCrewFlights(true);
    }
    // }, [filters.LastDays, filters.status, RM_UserId, fetchCrewFlights]);
  }, [filters.LastDays, filters.status, fetchCrewFlights]);

  const { startDate, endDate } = useMemo(() => {
    const currentDate = new Date();

    const end = new Date(currentDate);
    end.setHours(23, 59, 59, 999);
    const offset = Number(filters.LastDays) - 1;

    const start = new Date(currentDate);
    start.setDate(start.getDate() - offset);
    start.setHours(0, 0, 0, 0);

    return { startDate: start, endDate: end };
  }, [filters.LastDays]);

  const filteredFlights = useMemo(() => {
    if (!data?.length) return [];

    return data?.filter((flight) => {
      const flightDate = flight?.FlightDate;

      const dateMatch =
        flightDate >= formatDateISO(startDate) &&
        flightDate <= formatDateISO(endDate);

      const flightStatus = (flight.Status || "").toLowerCase().trim();
      const filterStatus = (filters?.status || "").toLowerCase().trim();

      if (!filterStatus) return dateMatch;

      let statusMatch = false;

      if (filterStatus === "approved by egca") {
        statusMatch = flightStatus === "egca_approve";
      } else if (filterStatus === "rejected by egca") {
        statusMatch = flightStatus === "egca_reject";
      } else if (filterStatus === "approved") {
        statusMatch = flightStatus.includes("approve") && !flightStatus.includes("egca");
      } else if (filterStatus === "pending") {
        statusMatch = flightStatus.includes("pending");
      } else if (filterStatus === "rejected") {
        statusMatch = flightStatus.includes("reject") && !flightStatus.includes("egca");
      }

      return dateMatch && statusMatch;
    });

  }, [data, filters, startDate, endDate]);

  return (
    <>
      <div className="min-h-screen w-full bg-surfaceBase overflow-hidden">
        <div className="hidden md:block">
          <Banner />
        </div>

        <div className="md:-mt-14 mt-4 sm:-mt-20 z-10 relative md:px-22 px-4">
          <TabFilters
            onFilterChange={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }))}
            initialFilters={filters}
          />
        </div>

        <main className="mx-auto md:px-10 lg:px-24 px-4 md:py-8 py-5 grid grid-cols-1 md:gap-4 gap-5 mt-2">
          {initialLoading ? (
            <div className="flex justify-center items-center w-full py-10">
              <img src={FlightLoadingGIF} alt="Loading..." className="" />
            </div>
          ) : filteredFlights?.length > 0 ? (
            filteredFlights?.map((flight, idx) => (
              <FlightCard
                index={idx}
                flight={flight}
                key={flight.id ?? idx}
                onClick={() => setSelectedFlight(flight)}
              />
            ))
          ) : (
            <p className="text-surfaceMuted text-center w-full">No flight data available</p>
          )}
        </main>

        {selectedFlight &&
          createPortal(
            <CustomPopup
              isOpen={true}
              title="Flight Details"
              RM_UserId={RM_UserId}
              flight={selectedFlight}
              onUpdate={fetchCrewFlights}
              onClose={() => setSelectedFlight(null)}
            />,
            document.body
          )}
      </div>
    </>
  );
};

export default React.memo(FlightDashboard);

