import { createQueryString } from '@/utils/helper';
import apiClient from './axios';

export const pilotService = {
 
  getPersonalDetails: async (userId) => {
    const response = await apiClient.get(`/personaldetails?userid=${userId}`);
    return response?.data;
  },


  getPilotCrewFlights: async (query) => {
    // const response = await apiClient.get(`/egcaix/crewFlights?RM_UserId=${id}&${createQueryString(query)}`);
    const response = await apiClient.get(`/egcaix/crewFlights?${createQueryString(query)}`);
    return response?.data;
  },


  createSubmitPilotCrewFlight: async (payload) => {
    const response = await apiClient.post('/egcaix/crewSubmitFlightLog', payload);
    return response?.data;
  },

   getChangeReasonEnum: async () => {
    const response = await apiClient.get('/egcaix/changeReasonEnum');
    return response?.data;
  },

  postTLChangeRequest: async (payload) => {
    const response = await apiClient.post('/egcaix/submitTLChanges', payload);
    return response?.data;
  }
};
