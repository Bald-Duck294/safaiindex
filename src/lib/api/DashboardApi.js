// lib/api/DashboardApi.js
import axiosInstance from "../axiosInstance";
export const DashboardApi = {
  // 1. Get counts only
  getCounts: async (companyId, date) => {
    try {
      const params = new URLSearchParams({
        companyId,
        date: date || new Date().toISOString().split('T')[0]
      });
      
      const response = await axiosInstance.get(
        `/dashboard/counts?${params.toString()}`
      );
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error fetching counts:', error);
      return { success: false, error: error.message };
    }
  },
  
  // 2. Get top locations
  getTopLocations: async (companyId, limit = 5, date) => {
    try {
      const params = new URLSearchParams({
        companyId,
        limit,
        date: date || new Date().toISOString().split('T')[0]
      });
      
      const response = await axiosInstance.get(
        `/dashboard/top-locations?${params.toString()}`
      );
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error fetching top locations:', error);
      return { success: false, error: error.message };
    }
  },
  
  // 3. Get today's activities
  getActivities: async (companyId, limit = 10, date) => {
    try {
      const params = new URLSearchParams({
        companyId,
        limit,
        date: date || new Date().toISOString().split('T')[0]
      });
      
      const response = await axiosInstance.get(
        `/dashboard/activities?${params.toString()}`
      );
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error fetching activities:', error);
      return { success: false, error: error.message };
    }
  }
};
