// src/store/slices/authSlice.js
"use client";

import { createSlice } from "@reduxjs/toolkit";

// Function to safely get the initial state from localStorage
const getInitialState = () => {
  // This check prevents errors during server-side rendering in Next.js
  if (typeof window === 'undefined') {
    return { user: null, isFetching: false, error: false };
  }
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      return { user: JSON.parse(storedUser), isFetching: false, error: false };
    }
  } catch (error) {
    console.error("Failed to parse user from localStorage", error);
    // If parsing fails, clear the corrupted item
    localStorage.removeItem('user');
  }
  // Default state if nothing is in localStorage or if on the server
  return { user: null, isFetching: false, error: false };
};

const authSlice = createSlice({
  name: "auth", // It's good practice to name the slice consistently
  initialState: getInitialState(),
  reducers: {
    // Dispatched when the login process starts
    loginStart: (state) => {
      state.isFetching = true;
      state.error = false;
    },
    // Dispatched on a successful API response
    loginSuccess: (state, action) => {
      state.user = action.payload;
      state.isFetching = false;
      state.error = false;
      try {
        // Save the entire user object to localStorage
        localStorage.setItem("user", JSON.stringify(action.payload));
      } catch (error) {
        console.error('Error saving user data to local storage:', error);
      }
    },
    // Dispatched on a failed API response
    loginFailure: (state) => {
      state.user = null;
      state.isFetching = false;
      state.error = true;
    },
    // Dispatched to log the user out
    logout: (state) => {
      state.user = null;
      state.isFetching = false;
      state.error = false;
      try {
        // Clear the user from localStorage
        localStorage.removeItem("user");
      } catch (error) {
        console.error('Error removing user data from local storage:', error);
      }
    },
  },
});

// Export the actions to be used in your components
export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
} = authSlice.actions;

// Export the reducer to be added to the store
export default authSlice.reducer;
