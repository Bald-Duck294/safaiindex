// src/store/slices/notificationApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// 'http://localhost:8000/api'
const API_BASE_URL = "https://saaf-ai-backend.vercel.app/api"

export const notificationApi = createApi({
  reducerPath: 'notificationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // Get token from auth state
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Notifications', 'FCMToken'],

  endpoints: (builder) => ({
    // Save FCM token to backend
    saveFCMToken: builder.mutation({
      query: ({ fcmToken, userId }) => ({
        url: '/save-fcm-token',
        method: 'POST',
        body: { fcm_token: fcmToken, user_id: userId },
      }),
      invalidatesTags: ['FCMToken'],
    }),

    // Get user's FCM token from backend
    getFCMToken: builder.query({
      query: (userId) => `/fcm-token/${userId}`,
      providesTags: ['FCMToken'],
    }),

    // Optional: Get notification history from backend (if you store them)
    getNotifications: builder.query({
      query: ({ userId, limit = 50 }) => `/notifications?user_id=${userId}&limit=${limit}`,
      providesTags: ['Notifications'],
    }),

    // Optional: Mark notification as read on backend
    markNotificationAsRead: builder.mutation({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),

    // Optional: Delete notification from backend
    deleteNotification: builder.mutation({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const {
  useSaveFCMTokenMutation,
  useGetFCMTokenQuery,
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useDeleteNotificationMutation,
} = notificationApi;
