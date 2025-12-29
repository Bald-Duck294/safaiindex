import axios from "axios";
import API_BASE_URL from "../utils/Constant";
import { measureMemory } from "vm";
import axiosInstance from "../axiosInstance";



// const API_BASE_URL = "http://localhost:8000/api";
// const API_BASE_URL = "https://saaf-ai-backend.onrender.com/api";
// const API_BASE_URL = "https://saaf-ai-backend.vercel.app/api"



export const AuthApi = {
  register: async (userData) => {
    console.log(userData, "user data from register");
    try {
      const response = await axios.post(`${API_BASE_URL}/register`, userData);
      console.log(response, "response");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error during registration:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  // Login user
  login: async (phone, password) => {
    console.log(phone, password, "cread form login");
    try {
      console.log('requst made')
      const response = await axios.post(`${API_BASE_URL}/login`, {
        phone,
        password,
      });
      console.log(response, "response");

      if (response.data.sucess) {
        const { user, token } = response.data;

        if (!user?.role || !Array.isArray(user?.role.permissions)) {
          console.error('❌ Backend returned user without role/permissions')
          toast.error('❌ Backend returned user without role/permissions')
          return {
            sucess: false,
            data: []
          }
        }
      }
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error during login:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },
  refreshUser: async () => {

    try {
      // this checks type of device weather browser or backend
      const token = typeof windonw !== 'undefined' ? localStorage.getItem('token') : null

      if (!token) {
        return { success: false, error: 'No token found' };
      }


      const response = await axiosInstance(`${API_BASE_URL}/auth/me`)


      if (response.data.success) {
        return {
          success: true,
          data: response.data.user,
        };
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

};
