import axiosInstance from "../axiosInstance";
// import API_BASE_URL from "../utils/Constant";


// const API_BASE_URL = 'http://localhost:8000/api'
export const AssignmentsApi = {

  createAssignment: async (assignmentData) => {
    console.log("in create assighments", assignmentData);
    try {
      const response = await axiosInstance.post(
        `/assignments`,
        assignmentData
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error creating assignment:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  getAllAssignments: async (companyId) => {
    console.log(companyId, "company id form api assignments ")
    try {
      const url = `/assignments?company_id=${companyId}`

      const response = await axiosInstance.get(url);
      console.log(response, "assign response");
      console.log(url, 'url',)

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching assignments:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  getAssignmentById: async (id, companyId) => {

    console.log('in get assignment by id ', id, companyId);
    try {
      const url = `/assignments/cleaner/${id}${companyId ? `?company_id=${companyId}` : ''}`;

      const response = await axiosInstance.get(url);
      console.log('Single assignment response:', response.data);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching assignment:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  updateAssignment: async (id, assignmentData) => {
    try {
      const response = await axiosInstance.post(
        `/assignments/${id}`,
        assignmentData
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error updating assignment:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  deleteAssignment: async (id) => {
    try {
      const response = await axiosInstance.delete(
        `/assignments/${id}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error deleting assignment:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  // ✅ NEW: Create assignments for a location (1 location → multiple cleaners)
  createAssignmentsForLocation: async (assignmentData) => {
    console.log("in create assignments for location", assignmentData);
    try {
      const response = await axiosInstance.post(
        `/assignments/location/create`,  // New endpoint
        assignmentData
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error creating assignments for location:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  getAssignmentsByLocation: async (locationId, companyId) => {
    console.log('Fetching assignments for location:', locationId);
    try {
      const params = new URLSearchParams();
      if (companyId) {
        params.append('company_id', companyId);
      }

      const response = await axiosInstance.get(
        `/assignments/location/${locationId}?${params.toString()}`
      );

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error fetching assignments by location:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: []
      };
    }
  },

  // In assignmentsApi.js - Add this method if not already present
  getAssignmentsByCleanerId: async (cleanerUserId, companyId) => {
    try {
      const params = new URLSearchParams();
      if (companyId) {
        params.append('company_id', companyId);
      }

      const response = await axiosInstance.get(
        `/assignments/cleaner-id/${cleanerUserId}?${params.toString()}`
      );

      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      console.error('Error fetching assignments by cleaner:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: []
      };
    }
  },

  // You can add getById, update, and delete methods here following the same pattern
};
