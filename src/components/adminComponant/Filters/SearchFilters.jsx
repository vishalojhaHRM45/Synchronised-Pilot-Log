import React, { useState, useMemo, useEffect } from "react";
import FlipButton from "@/components/common/FlipButton";
import CustomSearchableDropdown from "@/components/common/CustomSearchableDropdown";

const dropdownFields = (
  crewOptions = [],
  tailNumberOptions = [],
  flightNumberOptions = [],
  rejectionTypeOptions = [],
  entryByOptions = []
) => [
    { name: "crewID", label: "Pilot", placeholder: "Select Pilot", options: crewOptions },
    { name: "entryBy", label: "Entry By", placeholder: "Select Entry By", options: entryByOptions },
    { name: "RejectionType", label: "Rejection Reason", placeholder: "Select Rejection Reason", options: rejectionTypeOptions },
    { name: "tailNumber", label: "Tail Number", placeholder: "Select Tail Number", options: tailNumberOptions },
    { name: "flightNumber", label: "Flight Number", placeholder: "Select Flight Number", options: flightNumberOptions },
  ];

const SearchFilters = ({
  data = [],
  currentFilters,
  filterOptions,
  setSelectedFilters,
  refetchAdminData,
  fetchFiltersOptions,
  onFilteredData,
}) => {
  const [filters, setFilters] = useState({
    crewID: null,
    entryBy: null,
    tailNumber: null,
    flightNumber: null,
    RejectionType: null,
    DaysStatus: "Last28",
  });

  const [isFlipped, setIsFlipped] = useState(false);

  // ─── Options Generation ────────────────────────────────────────
  const crewOptions = useMemo(() => {
    const map = new Map();
    data.forEach(item => {
      (item.entries || [item]).forEach(entry => {
        if (entry.picId) {
          const id = entry.picId.toString();
          const name = entry.picName || entry.PICName || "";
          map.set(id, { label: name ? `${id} - ${name}` : id, value: id });
        }
        if (entry.copilotId) {
          const id = entry.copilotId.toString();
          const name = entry.copilotName || entry.CopilotName || "";
          map.set(id, { label: name ? `${id} - ${name}` : id, value: id });
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => a.value.localeCompare(b.value, undefined, { numeric: true }));
  }, [data]);

  const tailNumberOptions = useMemo(() => {
    const set = new Set();
    data.forEach(item => (item.entries || [item]).forEach(e => {
      if (e.tailNumber) set.add(e.tailNumber.toString());
      if (e.TailNumber) set.add(e.TailNumber.toString());
    }));
    return [...set].sort().map(v => ({ label: v, value: v }));
  }, [data]);

  const flightNumberOptions = useMemo(() => {
    const set = new Set();
    data.forEach(item => (item.entries || [item]).forEach(e => {
      if (e.flightNumber) set.add(e.flightNumber.toString());
      if (e.FlightNumber) set.add(e.FlightNumber.toString());
    }));
    return [...set].sort().map(v => ({ label: v, value: v }));
  }, [data]);

  // Rejection Type Code Mapping
  const rejectionTypeCodeMap = {
    "Difference in OOOI Timings": "1",
    "Other Reason": "3"
  };

  const rejectionTypeOptions = useMemo(() => {
    if (!filterOptions?.AvailableRejectionTypes) return [];
    const raw = typeof filterOptions.AvailableRejectionTypes === 'string'
      ? filterOptions.AvailableRejectionTypes.split('|').map(t => t.trim())
      : filterOptions.AvailableRejectionTypes || [];
    return raw.map(v => ({ 
      label: v, 
      value: rejectionTypeCodeMap[v] || v  // Send code to API, fallback to label if not mapped
    }));
  }, [filterOptions?.AvailableRejectionTypes]);

  const entryByOptions = useMemo(() => {
    if (!filterOptions?.EntryBy) return [];
    const raw = typeof filterOptions.EntryBy === 'string'
      ? filterOptions.EntryBy.split('|').map(e => e.trim())
      : filterOptions.EntryBy || [];
    return raw.map(v => ({ label: v, value: v }));
  }, [filterOptions?.EntryBy]);

  // ─── Critical Sync: Always re-match selected values ────────────
  useEffect(() => {
    setFilters(prev => {
      const next = { ...prev };

      next.crewID = currentFilters.crewID
        ? crewOptions.find(o => o.value === currentFilters.crewID) ?? null
        : null;

      // Most important fixes ──────
      next.entryBy = currentFilters.entryBy && currentFilters.entryBy !== ""
        ? entryByOptions.find(o => o.value === currentFilters.entryBy) ?? null
        : null;

      next.RejectionType = currentFilters.RejectionType && currentFilters.RejectionType !== ""
        ? rejectionTypeOptions.find(o => o.value === currentFilters.RejectionType) ?? null
        : null;
      // ────────────────────────────

      next.tailNumber = currentFilters.tailNumber
        ? tailNumberOptions.find(o => o.value === currentFilters.tailNumber) ?? null
        : null;

      next.flightNumber = currentFilters.flightNumber
        ? flightNumberOptions.find(o => o.value === currentFilters.flightNumber) ?? null
        : null;

      next.DaysStatus = currentFilters.DaysStatus || "Last28";

      return next;
    });
  }, [
    currentFilters,
    crewOptions, entryByOptions, rejectionTypeOptions,
    tailNumberOptions, flightNumberOptions
  ]);

  const handleDropdownSelect = (option, field) => {
    setFilters(prev => {
      const newState = { ...prev, [field]: option };

      // Build API filters only with selected values
      const apiFilters = {
        rejectionType: newState.RejectionType?.value || null,
        tailNumber: newState.tailNumber?.value || null,
        flightNumber: newState.flightNumber?.value || null,
        pilot: newState.crewID?.value || null,
        entryBy: newState.entryBy?.value || null,
      };

      setSelectedFilters(apiFilters);

      const lastDays =
        newState.DaysStatus === "Yesterday" ? 1 :
          newState.DaysStatus === "Last7" ? 7 :
            newState.DaysStatus === "Last14" ? 14 : 28;

      // Only call once with both data fetch and filter options
      refetchAdminData?.(lastDays, 1, apiFilters);
      
      // Delay fetchFiltersOptions to avoid duplicate API calls
      setTimeout(() => {
        fetchFiltersOptions?.(apiFilters);
      }, 100);

      onFilteredData({
        crewID: newState.crewID?.value || "",
        entryBy: newState.entryBy?.value || "",
        tailNumber: newState.tailNumber?.value || "",
        flightNumber: newState.flightNumber?.value || "",
        RejectionType: newState.RejectionType?.value || "",
        DaysStatus: newState.DaysStatus || "Last28",
      });

      return newState;
    });
  };

  const handleReset = () => {
    setIsFlipped(true);

    const emptyState = {
      crewID: null,
      entryBy: null,
      tailNumber: null,
      flightNumber: null,
      RejectionType: null,
      DaysStatus: "Last28",
    };

    setFilters(emptyState);

    const emptyApi = { rejectionType: null, tailNumber: null, flightNumber: null, pilot: null, entryBy: null };
    setSelectedFilters(emptyApi);

    refetchAdminData?.(28, 1, emptyApi);
    
    // Delay to avoid loading state overlap
    setTimeout(() => {
      fetchFiltersOptions?.(emptyApi);
    }, 100);

    onFilteredData({
      crewID: "", entryBy: "", tailNumber: "", flightNumber: "", RejectionType: "", DaysStatus: "Last28"
    });

    setTimeout(() => setIsFlipped(false), 800);
  };

  const isActive = !!filters.crewID || !!filters.entryBy || !!filters.tailNumber ||
    !!filters.flightNumber || !!filters.RejectionType;

  return (
    <div className="w-full py-3 bg-bgGradient px-3 rounded-t-2xl mb-2">
      <div className="grid gap-1 grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(160px,1fr))]">
        {dropdownFields(
          crewOptions, tailNumberOptions, flightNumberOptions,
          rejectionTypeOptions, entryByOptions
        ).map(({ name, label, options, placeholder }) => (
          <div className="flex flex-col" key={name}>
            <label className="text-xs text-textPrimary font-semibold mb-1">{label}</label>
            <CustomSearchableDropdown
              options={options}
              value={filters[name]}
              onSelect={opt => handleDropdownSelect(opt, name)}
              placeholder={placeholder}
              className="w-full"
              isClearable={true}
              isSearchable={true}
            />
          </div>
        ))}

        {isActive && (
          <div className="flex flex-col">
            <label className="invisible mb-1 text-xs">Actions</label>
            <FlipButton
              isFlipped={isFlipped}
              onClick={handleReset}
              frontText="Reset"
              backText="Resetting..."
              frontStyle="bgGradient-Button text-surfaceBase"
              backStyle="bgGradient-Button"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(SearchFilters);