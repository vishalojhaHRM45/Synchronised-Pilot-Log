import React, { useState} from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import VerifyTableComponent from "@/components/verifyHistory/VerifyTableComponent";
import VerifyDataProvider from "@/components/verifyHistory/VerifyDataProvider";
import Header from "@/components/pilotComponent/Header";
import Button from "@/components/common/Button";
import { ArrowLeft } from "lucide-react";

const VerifierHistory = () => {
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const navigate = useNavigate();

  const Inner = ({ filteredData, showPilotData, refetchAdminData }) => {
    const tableData =
      displayData.length > 0 ? displayData : filteredData;

    return (
      <>
        <Header />
        <div className="p-4 min-h-screen main-b">
          <header className="flex justify-between items-center mt-2 mb-2 md:px-3">
            <h1 className="md:text-2xl text-md font-bold">
              Archived Logs
            </h1>

            <Button
              onClick={() => navigate("/admin/dashboard")}
              className="flex items-center gap-2 toggle-on text-surfaceBase px-4 py-2 rounded hover:bg-surfaceMuted transition-colors"
            >
              <ArrowLeft className="w-8 h-4" />
              Log Summary
            </Button>
          </header>

          <div className="bg-bgGradient shadow-md rounded-b-2xl p-3 mt-3">
            <VerifyTableComponent
              data={tableData}
              selectedGroups={selectedGroups}
              setSelectedGroups={setSelectedGroups}
              showPilotData={showPilotData}
              refetchAdminData={refetchAdminData}
            />
          </div>
        </div>
      </>
    );
  };

  return (
    <VerifyDataProvider>
      {({ filteredData, showPilotData, refetchAdminData }) => (
        <Inner
          filteredData={filteredData}
          showPilotData={showPilotData}
          refetchAdminData={refetchAdminData}
        />
      )}
    </VerifyDataProvider>
  );
};

export default React.memo(VerifierHistory);
