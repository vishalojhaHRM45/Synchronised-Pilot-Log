import { useState, useMemo, useEffect } from "react";
import SearchFilters from "./SearchFilters";
import NoDataPopup from "@/components/common/NoDataFound";

const FilterSection = ({
  data,
  filters: parentFilters,
  setFilters,
  filterOptions,
  selectedFilters,
  setSelectedFilters,
  refetchAdminData,
  fetchFiltersOptions,
}) => {
  const [showNoDataPopup, setShowNoDataPopup] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Full local filter state (including entryBy)
  const [localFilters, setLocalFilters] = useState({
    crewID: "",
    entryBy: "",
    RejectionType: "",
    tailNumber: "",
    flightNumber: "",
    DaysStatus: "Last28",
  });

  // Sync local filters with parent filters (only when not resetting)
  useEffect(() => {
    if (parentFilters && !isResetting) {
      setLocalFilters((prev) => ({
        ...prev,
        crewID: parentFilters.crewID || "",
        entryBy: parentFilters.entryBy || "",
        RejectionType: parentFilters.RejectionType || "",
        tailNumber: parentFilters.tailNumber || "",
        flightNumber: parentFilters.flightNumber || "",
        DaysStatus: parentFilters.DaysStatus || "Last28",
      }));
    }
  }, [parentFilters, isResetting]);

  // Show "No Data" popup when filters are active but no results
  useEffect(() => {
    const isAnyFilterApplied =
      localFilters.crewID ||
      localFilters.entryBy ||
      localFilters.RejectionType ||
      localFilters.tailNumber ||
      localFilters.flightNumber;

    if (data.length === 0 && isAnyFilterApplied) {
      setShowNoDataPopup(true);
    }
  }, [data, localFilters]);

  const crewIDs = useMemo(() => {
    const ids = new Set();
    data.forEach((item) => {
      if (item.entries && Array.isArray(item.entries)) {
        item.entries.forEach((entry) => {
          if (entry.picId) ids.add(entry.picId);
          if (entry.copilotId) ids.add(entry.copilotId);
        });
      }
    });
    return Array.from(ids).filter(Boolean).sort();
  }, [data]);

  // Receive updated filters from SearchFilters
  const handleFilteredData = (newFiltersFromChild) => {
    setLocalFilters(newFiltersFromChild);
    setFilters(newFiltersFromChild); // sync to parent
  };

  // Reset logic — exactly same style as your SearchFilters handleReset
  const handleReset = () => {
    setIsResetting(true);

    // Reset local filters
    const resetFilters = {
      crewID: "",
      entryBy: "",
      RejectionType: "",
      tailNumber: "",
      flightNumber: "",
      DaysStatus: "Last28",
    };

    setLocalFilters(resetFilters);
    setFilters(resetFilters);

    // Reset API filters
    const emptyApiFilters = {
      rejectionType: null,
      tailNumber: null,
      flightNumber: null,
      pilot: null,
      entryBy: null,
    };

    setSelectedFilters(emptyApiFilters);

    // Refetch clean data
    refetchAdminData?.(28, 1, emptyApiFilters);
    fetchFiltersOptions?.(emptyApiFilters);

    // Small delay for flip animation (same as your SearchFilters)
    setTimeout(() => {
      setIsResetting(false);
    }, 800);
  };

  return (
    <div className="mx-auto">
      <SearchFilters
        crewIDs={crewIDs}
        data={data}
        onFilteredData={handleFilteredData}
        currentFilters={localFilters}
        filterOptions={filterOptions}
        selectedFilters={selectedFilters}
        setSelectedFilters={setSelectedFilters}
        refetchAdminData={refetchAdminData}
        fetchFiltersOptions={fetchFiltersOptions}
        isResetting={isResetting}
        setIsResetting={setIsResetting}
      />

      <NoDataPopup
        isOpen={showNoDataPopup}
        onClose={() => setShowNoDataPopup(false)}
        onReset={handleReset}
      />
    </div>
  );
};

export default FilterSection;