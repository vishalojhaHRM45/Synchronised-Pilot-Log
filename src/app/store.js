import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import crewFlightReducer from './features/crewFlightSlice';
import notificationReducer from "./features/notificationSlice";


export const store = configureStore({
  reducer: {
    auth: authReducer,
    crewFlight: crewFlightReducer,
    notifications: notificationReducer,
  },
});