import React from "react";
import CustomDropdown from "./../common/CustomDropdown";

function TabFilters({ onFilterChange, initialFilters }) {
  const selectedDays = initialFilters?.LastDays || "28";
  const selectedStatus = initialFilters?.status || "";

  const dayoptions = [
    { label: "Yesterday", value: "1" },
    { label: "Last 7 Days", value: "7" },
    { label: "Last 14 Days", value: "14" },
    { label: "Last 28 Days", value: "28" },
  ];

  const statusOptions = [
    "Approved",
    "Pending",
    "Rejected",
    "Rejected BY EGCA",
    "Approved BY EGCA",
  ];

  const handleDaysChange = (day) => {
    onFilterChange({ LastDays: day, status: selectedStatus });
  };

  const handleStatusClick = (status) => {
    const newStatus = selectedStatus === status ? "" : status;
    onFilterChange({ LastDays: selectedDays, status: newStatus });
  };

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-center gap-3 primary-bgGradient p-3 md:p-4 rounded-xl shadow-md w-full sm:w-full md:w-auto mx-auto">
   
      <div className="w-full md:w-48 ">
        <CustomDropdown
          className="w-full"
          options={dayoptions}
          buttonClassName="bg-surfaceBase"
          onSelect={(option) => handleDaysChange(option.value)}
          buttonText={dayoptions.find((option) => option.value === selectedDays)?.label || "Yesterday"}
        />
      </div>


      <div className="flex w-full md:w-auto overflow-x-auto no-scrollbar justify-center">
        <div className="inline-flex">
          {statusOptions.map((status, idx) => (
            <button
              key={status}
              onClick={() => handleStatusClick(status)}
              className={`cursor-pointer px-2 py-1 text-[10px] sm:text-sm font-medium sm:py-2 sm:px-3 border border-blue-50 
                transition-colors duration-200 text-center leading-snug wrap-break-word whitespace-normal lg:py-3 lg:px-5 
                ${selectedStatus === status
                  ? "bg-primary text-surfaceBase border-blue-500"
                  : "bg-surfaceBase text-textSecondary hover:bg-blue-50 hover:border-blue-300"
                } ${idx === 0 ? "rounded-l-full" : ""} ${idx === statusOptions.length - 1 ? "rounded-r-full" : ""}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default React.memo(TabFilters);
