// src/store/slices/notificationSlice.js
import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    notifications: [], // Local notification queue (like YouTube)
    unreadCount: 0,
    fcmToken: null,
  },
  reducers: {
    addNotification: (state, action) => {
      const newNotification = {
        id: Date.now(),
        title: action.payload.title,
        body: action.payload.body,
        timestamp: new Date().toISOString(),
        read: false,
        data: action.payload.data || {},
      };
      
      // Add to beginning of array (newest first)
      state.notifications.unshift(newNotification);
      state.unreadCount += 1;
    },
    
    markAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    
    markAllAsRead: (state) => {
      state.notifications.forEach(n => n.read = true);
      state.unreadCount = 0;
    },
    
    clearNotification: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    
    setFCMToken: (state, action) => {
      state.fcmToken = action.payload;
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  clearNotification,
  clearAllNotifications,
  setFCMToken,
} = notificationSlice.actions;

export default notificationSlice.reducer;
