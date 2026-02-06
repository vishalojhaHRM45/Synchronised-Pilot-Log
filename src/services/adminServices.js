import apiClient from "./axios";

export const adminService = {
  getAdminFlights: async (lastDays, pageNo = 1, rejectionType = null, tailNumber = null, flightNumber = null, pilot = null, entryBy = null) => {
    try {
      const response = await apiClient.get(`/egcaix/adminFlights`, {
        params:
        {
          LastDays: lastDays,
          PageNumber: pageNo,
          RejectionType: rejectionType,
          TailNumber: tailNumber,
          FlightNumber: flightNumber,
          Pilot: pilot,
          EntryBy: entryBy,
        }
      });
      return response?.data;
    } catch (error) {
      console.error("getAdminFlights API Error:", error);
      throw error;
    }
  },

  getAdminFiltersOptions: async (rejectionType = null, tailNumber = null, flightNumber = null, pilot = null, entryBy = null) => {
    const response = await apiClient.get(`/egcaix/adminFilters`, {
      params: {
        RejectionType: rejectionType,
        TailNumber: tailNumber,
        FlightNumber: flightNumber,
        Pilot: pilot,
        EntryBy: entryBy,
      }
    });
    return response?.data;
  },

  submitAdminFlights: async (payload) => {
    const response = await apiClient.post("/egcaix/adminSubmission", payload);
    return response?.data;
  },


  getTechLogFileUrl: async (fileName) => {
    try {
      const response = await apiClient.get(`/egcaix/getTechLog/${fileName}`, {
        responseType: "blob",
      });
      return URL.createObjectURL(response.data);
    } catch (error) {
      console.error("getTechLogFileUrl API Error:", error);
      throw error;
    }
  },

  getAdminHistory: async () => {
    try {
      const response = await apiClient.get("/egcaix/adminHistory");
      const data = response?.data?.HistoricFlights;
      if (!Array.isArray(data)) {
        console.error(
          "getAdminHistory API Error: HistoricFlights is not an array",
          data
        );
        return [];
      }
      return data;
    } catch (error) {
      console.error("getAdminHistory API Error:", error);
      throw error;
    }
  },

  getRosterChanges: async (submissionId) => {
    try {
      const response = await apiClient.get("/egcaix/adminRosterChanges", {
        params: { SubmissionId: submissionId },
      });
      return response?.data || [];
    } catch (error) {
      console.error("getRosterChanges API Error:", error.response || error);
      throw error;
    }
  },
};