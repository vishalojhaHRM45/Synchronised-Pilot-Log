import apiClient from "./axios";

export const notificationService = {

  getPilotCrewFlights: async (SubmissionId) => {
    const response = await apiClient.get(
      // `/egcaix/crewFlights?RM_UserId=${id}&SubmissionId=${SubmissionId}`
      `/egcaix/crewFlights?SubmissionId=${SubmissionId}`
    );
    return response?.data;
  },


  getNotification: async () => {
    const response = await apiClient.get(
      // `/egcaix/getNotifications?RM_UserId=${userId}`
      `/egcaix/getNotifications`
    );
    return response?.data;
  },

  getSubscribeToPushNotifications: async () => {
    const response = await apiClient.get("/egcaix/getVapidKey");
    return response?.data;
  },

  postSubscribeNotification: async (payload) => {
    const response = await apiClient.post(
      "/egcaix/subscribeNotification",
      payload
    );
    return response?.data;
  },

  postUnSubscription: async (payload) => {
    const response = await apiClient.post("/egcaix/unsubscribe", payload);
    return response?.data;
  },

  updateNotification: async (id) => {
    let payload;
    if (Array.isArray(id)) {
      payload = { Id: id.join(",") };
    } else {
      payload = { Id: id };
    }
    const response = await apiClient.post("/egcaix/markNotifications", payload);
    return response?.data;
  },


  getAdminFlightBySubmissionId: async (SubmissionId) => {
    const response = await apiClient.get(
      `/egcaix/adminFlights?SubmissionId=${SubmissionId}`
    );
    return response?.data;
  },
};
