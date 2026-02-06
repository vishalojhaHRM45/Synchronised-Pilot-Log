import { createSlice } from "@reduxjs/toolkit";


const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    data: [],
  },
  reducers: {
    setNotifications: (state, action) => {
      state.data = action.payload;
    },

    markAsRead: (state, action) => {
      let ids = action.payload;
      if (typeof ids === "string") {
        ids = ids.split(",").map(Number);
      }
      if (!Array.isArray(ids)) {
        ids = [ids];
      }
      state.data = state.data.map(n =>
        ids.includes(n.Id) ? { ...n, Isread: true } : n
      );
    },

  },
});

export const { setNotifications, markAsRead, } = notificationSlice.actions;
export default notificationSlice.reducer;
