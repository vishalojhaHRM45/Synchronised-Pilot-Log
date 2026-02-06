import React, { useState, useEffect } from "react";

import toast from "react-hot-toast";
import { motion } from "framer-motion";


const VerifyActionButtons = ({
  onTogglePilotData,
  showPilotData,
  activeButton,
  setActiveButton,
  filters,
  setFilters,
  refetchAdminData,
}) => {
  const [isLoadingDateFilter, setIsLoadingDateFilter] = useState(false);

  useEffect(() => {
    setActiveButton(showPilotData ? "show" : "hide");
  }, [showPilotData, setActiveButton]);

  const handleDaysStatusChange = async (option) => {
    const newFilters = { ...filters, DaysStatus: option.value };
    setFilters(newFilters);

    if (!refetchAdminData) {
      console.warn("refetchAdminData is not available");
      return;
    }

    setIsLoadingDateFilter(true);

    try {
      let lastDays = 7; 
      
      switch (option.value) {
        case "Yesterday":
          lastDays = 1;
          break;
        case "Last7":
          lastDays = 7;
          break;
        case "Last14":
          lastDays = 14;
          break;
        case "Last28":
          lastDays = 28;
          break;
        default:
          lastDays = 7;
          break;
      }

      console.log(`Loading data for ${option.label} (lastdays=${lastDays})`);

      await refetchAdminData(lastDays);

      toast.success(`Data loaded for ${option.label}`);
    } catch (error) {
      console.error("Date filter failed:", error);
      toast.error("Failed to fetch data for selected date range");
    } finally {
      setIsLoadingDateFilter(false);
    }
  };

  const daysStatusOptions = [
    { label: "Yesterday", value: "Yesterday" },
    { label: "Last 7 Days", value: "Last7" },
    { label: "Last 14 Days", value: "Last14" },
    { label: "Last 28 Days", value: "Last28" },
  ];

  const handleShowClick = () => {
    setActiveButton("show");
    if (!showPilotData) {
      onTogglePilotData();
    }
  };

  const handleHideClick = () => {
    setActiveButton("hide");
    if (showPilotData) {
      onTogglePilotData();
    }
  };

  const getDaysStatusLabel = (daysStatus) => {
    switch (daysStatus) {
      case "Yesterday":
        return "Yesterday";
      case "Last7":
        return "Last 7 Days";
      case "Last14":
        return "Last 14 Days";
      case "Last28":
        return "Last 28 Days";
      default:
        return "Yesterday"; 
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 primary-bgGradient p-3 rounded-lg">

      <div className="relative flex flex-wrap sm:flex-nowrap items-center gap-2 md:gap-12 sm:w-auto">
        <div className="flex items-center">
          <span className="text-sm font-medium text-textPrimary w-20">
            Roster Data:
          </span>
          <div className="relative text-[13px] flex items-center bg-surfaceBase px-0.4 py-0.5 rounded-full ml-3 shadow-sm">
            <motion.div
              className="absolute inset-y-0 w-1/2 toggle-on rounded-full"
              initial={false}
              animate={{ x: activeButton === "show" ? "0%" : "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <button
              onClick={handleShowClick}
              className={`relative px-7 py-1.5 rounded-full font-medium z-10 ${
                activeButton === "show" ? "text-surfaceBase" : "text-textPrimary"
              }`}
            >
              Show
            </button>
            <button
              onClick={handleHideClick}
              className={`relative px-7 py-1.5 rounded-full font-medium z-10 ${
                activeButton === "hide" ? "text-surfaceBase" : "text-textPrimary"
              }`}
            >
              Hide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyActionButtons;