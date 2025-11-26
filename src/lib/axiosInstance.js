import axios from "axios";
import API_BASE_URL from "./utils/Constant";
// import store from "../store"; // your Redux store
import { store } from "@/store/store";
// console.log("in axios instance");

import toast from "react-hot-toast";
import { logout } from "@/store/slices/authSlice";
import { WindIcon } from "lucide-react";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

console.log(store.getState(), "store");
// Add interceptor to attach token
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth?.user?.token;
    // console.log(token, "token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let isTokenExpiredHandled = false;
axiosInstance.interceptors.response.use(
  response => {
    isTokenExpiredHandled = false;
    return response
  },
  (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data?.message?.toLowerCase().includes("token expired")
    ) {
      if (!isTokenExpiredHandled) {
        isTokenExpiredHandled = true;
        toast.error("Session expired, please login again.");

        // Dispatch logout action to clear Redux auth state
        store.dispatch(logout());

        // Redirect user to login page - use Next.js router or window.location
        window.location.href.replace("/login");
      }
      else {
        // Optionally reject with a specific message or cancel further API handling
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;