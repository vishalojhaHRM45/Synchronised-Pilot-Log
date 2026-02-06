import { useState } from "react";
import toast from "react-hot-toast";
import CustomDropdown from "@/components/common/CustomDropdown";

const ActionButtons = ({
  filteredData,
  filters,
  setFilters,
  filterOptions,
  refetchAdminData,
  setSelectedFilters,
  fetchFiltersOptions,
}) => {
  const [isLoadingDateFilter, setIsLoadingDateFilter] = useState(false);

  const handleDaysStatusChange = async (option) => {
    const newFilters = { ...filters, DaysStatus: option.value };
    setFilters(newFilters);

    if (!refetchAdminData) {
      console.warn("refetchAdminData is not available");
      return;
    }

    setIsLoadingDateFilter(true);

    try {
      let lastDays = 0;

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
          lastDays = 28;
          break;
      }

      const apiFilters = {
        rejectionType: null,
        tailNumber: null,
        flightNumber: null,
        pilot: null,
        entryBy: null,
      };
      if (setSelectedFilters) {
        setSelectedFilters(apiFilters);
      }

      await refetchAdminData(lastDays, 1, apiFilters);
      if (fetchFiltersOptions) {
        fetchFiltersOptions(apiFilters);
      }
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

  const currentLabel = getDaysStatusLabel(filters.DaysStatus)

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center primary-bgGradient p-3 rounded-lg">
      <div className="relative flex flex-wrap sm:flex-nowrap items-center md:gap-10 sm:w-auto">
        <div className="w-full md:w-48">
          <CustomDropdown
            variant="days-filter"
            options={daysStatusOptions}
            disabled={isLoadingDateFilter}
            onSelect={handleDaysStatusChange}
            buttonText={isLoadingDateFilter ? "Loading..." : currentLabel}
            buttonClassName={`block border border-gray-300 rounded-full text-[12px] px-5 py-2 text-textSecondary font-medium shadow-sm ${isLoadingDateFilter ? "opacity-50 cursor-not-allowed" : ""}`}
          />
          {isLoadingDateFilter && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
            </div>
          )}
        </div>

        <div className="">
          <div className="block w-full border border-gray-300 rounded-lg text-[12px] px-5 py-2 text-textSecondary font-medium shadow-sm bg-white">
            Pending Entries: {filterOptions?.Counts || 0}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionButtons;