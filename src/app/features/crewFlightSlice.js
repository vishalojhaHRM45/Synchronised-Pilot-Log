import { createSlice } from "@reduxjs/toolkit";

const crewFlightSlice = createSlice({
  name: "crewFlight",
  initialState: {
    data: []
  },

  reducers: {
    setCrewFlight: (state, action) => {
      state.data = action.payload;
    }
  },
});

export const { setCrewFlight } = crewFlightSlice.actions;
export default crewFlightSlice.reducer;