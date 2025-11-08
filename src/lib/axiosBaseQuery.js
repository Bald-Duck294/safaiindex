// src/lib/axiosBaseQuery.js
import axios from "axios";
// const API_BASE_URL = "http://localhost:8000/api";

const API_BASE_URL = "https://saaf-ai-backend.onrender.com/api";
// const API_BASE_URL = "https://safai-ai-651690228479.asia-south1.run.app/api"
// const API_BASE_URL = "https://saaf-ai-backend.vercel.app/api"

// Create axios instance WITHOUT importing store
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

const axiosBaseQuery = () => async ({ url, method, data, params }, api) => {
  try {
    // Get auth token from Redux state dynamically
    const state = api.getState();
    const token = state.auth?.user?.token;

    // Set auth header if token exists
    const config = {
      url,
      method,
      data,
      params,
      headers: {},
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const result = await axiosInstance(config);
    return { data: result.data };
  } catch (axiosError) {
    return {
      error: {
        status: axiosError.response?.status,
        data: axiosError.response?.data || axiosError.message,
      },
    };
  }
};

export default axiosBaseQuery;
