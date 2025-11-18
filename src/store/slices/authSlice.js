// src/store/slices/authSlice.js
"use client";

import { createSlice } from "@reduxjs/toolkit";

// Function to safely get the initial state from localStorage
const getInitialState = () => {
  if (typeof window === 'undefined') {
    return { user: null, isAuthenticated: false, isFetching: false, error: false };
  }
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      return { 
        user, 
        isAuthenticated: true, // ✅ Set to true if user exists
        isFetching: false, 
        error: false 
      };
    }
  } catch (error) {
    console.error("Failed to parse user from localStorage", error);
    localStorage.removeItem('user');
  }
  return { user: null, isAuthenticated: false, isFetching: false, error: false };
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    loginStart: (state) => {
      state.isFetching = true;
      state.error = false;
    },
    loginSuccess: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true; // ✅ Set to true on login
      state.isFetching = false;
      state.error = false;
      try {
        localStorage.setItem("user", JSON.stringify(action.payload));
      } catch (error) {
        console.error('Error saving user data to local storage:', error);
      }
    },
    loginFailure: (state) => {
      state.user = null;
      state.isAuthenticated = false; // ✅ Set to false on failure
      state.isFetching = false;
      state.error = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false; // ✅ Set to false on logout
      state.isFetching = false;
      state.error = false;
      try {
        localStorage.removeItem("user");
      } catch (error) {
        console.error('Error removing user data from local storage:', error);
      }
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
