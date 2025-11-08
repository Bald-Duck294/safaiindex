import axios from "axios"; // Using axios as it's common for such patterns

// This should be in a central config file, e.g., src/lib/utils/constants.js
const API_BASE_URL = "http://localhost:8000/api";
import axiosInstance from "../axiosInstance";

// // You can create a reusable axiosInstance if you need to handle auth tokens
// const axiosInstance = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

export const CompanyApi = {
  createCompany: async (companyData) => {
    try {
      const response = await axiosInstance.post("/companies", companyData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  getAllCompanies: async () => {
    console.log("in get all companies");
    try {
      const response = await axiosInstance.get("/companies");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  getCompanyById: async (id) => {
    console.log('get by id company ')
    try {
      const response = await axiosInstance.get(`/companies/${id}`);
      console.log(response?.data , "data")
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  updateCompany: async (id, companyData) => {
    console.log('update')
    try {
      const response = await axiosInstance.post(`/companies/${id}`, companyData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  deleteCompany: async (id) => {
    try {
      const response = await axiosInstance.delete(`/companies/${id}`);
      return { success: true, data: response.data }; // response.data will be empty on 204
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },
};
