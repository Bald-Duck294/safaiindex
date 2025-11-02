import axios from "axios";
// import API_BASE_URL from "./utils/Constant";
// import store from "../store"; // your Redux store
import { store } from "@/store/store";
// console.log("in axios instance");

// const API_BASE_URL = "http://localhost:8000/api";
const API_BASE_URL = "https://saaf-ai-backend.onrender.com/api";

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

export default axiosInstance;
