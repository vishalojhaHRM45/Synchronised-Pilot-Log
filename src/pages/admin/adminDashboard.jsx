import React, { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { adminService } from "@/services";
import Header from "@/components/pilotComponent/Header";
import ActionButtons from "@/components/adminComponant/Filters/ActionButtons";
import TableComponent from "@/components/adminComponant/Table/TableComponent";
import FilterSection from "@/components/adminComponant/Filters/FilterSection";
import DataProvider from "@/components/adminComponant/Table/Data/DataProvider";
import TableHeader from "@/components/adminComponant/Table/tableHeader";

const AdminDashboard = () => {
  const [filters, setFilters] = useState({
    crewID: "",
    RejectionType: "",
    tailNumber: "",
    flightNumber: "",
    DaysStatus: "Last28",
  });
  const [selectedGroups, setSelectedGroups] = useState([]);
  const { role } = useSelector((state) => state.auth);

  useEffect(() => {
    if (role !== "admin") {
      window.location.href = "/pilot/dashboard";
    }
  }, [role]);

  const handleApprove = useCallback(async (values, refetchAdminData) => {
    try {
      const payload = {
        ...values,
        AdminAction: "APPROVE",
      };
      const response = await adminService.submitAdminFlights(payload);
      if (response?.code === 200 && response?.status === "success") {
        toast.success(`Successfully approved`);
        setSelectedGroups([]);
      } else {
        toast.error(response?.message);
      }

      if (refetchAdminData) {
        const lastDays =
          filters.DaysStatus === "Yesterday"
            ? 1
            : filters.DaysStatus === "Last7"
              ? 7
              : filters.DaysStatus === "Last14"
                ? 14
                : filters.DaysStatus === "Last28"
                  ? 28
                  : 28;
        await refetchAdminData(lastDays);
      }
    } catch (error) {
      console.error("Approval failed:", error);
      toast.error(error?.message || "Failed to approve the entries");
    }
  },
    [filters.DaysStatus]
  );

  const Inner = ({ filteredData, showPilotData, refetchAdminData, currentLastDays, currentPage, filterOptions, selectedFilters, setSelectedFilters, fetchFiltersOptions }) => {
    const onApproveWithRefetch = useCallback((values) => {
      handleApprove(values, refetchAdminData)
    }, [handleApprove, refetchAdminData]);

    const tableData = filteredData;

    return (
      <>
        <TableHeader />
        <FilterSection
          data={filteredData}
          filters={filters}
          setFilters={setFilters}
          refetchAdminData={refetchAdminData}
          filterOptions={filterOptions}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          fetchFiltersOptions={fetchFiltersOptions}
        />
        <div className="bg-bgGradient shadow-md rounded-b-2xl p-3">
          <ActionButtons
            filteredData={filteredData}
            filters={filters}
            setFilters={setFilters}
            filterOptions={filterOptions}
            refetchAdminData={refetchAdminData}
            setSelectedFilters={setSelectedFilters}
            fetchFiltersOptions={fetchFiltersOptions}
          />
          <div className="mt-3">
            <TableComponent
              data={tableData}
              filters={filters}
              selectedGroups={selectedGroups}
              setSelectedGroups={setSelectedGroups}
              showPilotData={showPilotData}
              onApprove={onApproveWithRefetch}
              refetchAdminData={refetchAdminData}
              currentLastDays={currentLastDays}
              currentPage={currentPage}
            />
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <Header />
      <div className="p-4 min-h-screen main-b">
        <DataProvider>
          {({
            filteredData,
            showPilotData,
            refetchAdminData,
            currentLastDays,
            currentPage,
            filterOptions,
            selectedFilters,
            setSelectedFilters,
            fetchFiltersOptions,
          }) => (
            <Inner
              filteredData={filteredData}
              showPilotData={showPilotData}
              refetchAdminData={refetchAdminData}
              currentLastDays={currentLastDays}
              currentPage={currentPage}
              filterOptions={filterOptions}
              selectedFilters={selectedFilters}
              setSelectedFilters={setSelectedFilters}
              fetchFiltersOptions={fetchFiltersOptions}
            />
          )}
        </DataProvider>
      </div>
    </>
  );
};

export default React.memo(AdminDashboard);