// lib/api/usersApi.js
import axiosInstance from "../axiosInstance";
import API_BASE_URL from "../utils/Constant";

export const UsersApi = {
  // Get all users with optional filters
  getAllUsers: async (companyId = null, roleId = null) => {
    // console.log("in get all user", companyId);
    try {
      const params = new URLSearchParams();
      if (companyId) {
        params.append("companyId", companyId);
      }
      if (roleId) {
        params.append("roleId", roleId);
      }

      const response = await axiosInstance.get(`/users?${params.toString()}`);
      // console.log(response, "response users");

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  // Get users by role
  getUsersByRole: async (roleId, companyId = null) => {
    try {
      // Get all users first
      const response = await UsersApi.getAllUsers(companyId);

      if (response.success) {
        const allUsers = response.data || [];
        // Filter by role_id client-side
        const filteredUsers = allUsers.filter(user => user.role_id === roleId);

        // console.log(filteredUsers, "filter users");
        return {
          success: true,
          data: filteredUsers,
        };
      }

      return response;
    } catch (error) {
      console.error("Error fetching users by role:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  getUserById: async (id) => {
    try {
      const response = await axiosInstance.get(`/users/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  // createUser: async (data, companyId) => {
  //   console.log(data, "Create User Data");
  //   console.log(companyId, "companyId")
  //   try {
  //     const response = await axiosInstance.post(`/users?companyId=${companyId}`, data);
  //     console.log(response, "create user response");
  //     return {
  //       success: true,
  //       data: response.data
  //     };
  //   } catch (error) {
  //     console.error("Error creating user:", error);
  //     return {
  //       success: false,
  //       error: error.response?.data?.message || error.message,
  //     };
  //   }
  // },

  createUser: async (data, companyId) => {
    console.log(data, "Create User Data");
    console.log(companyId, "companyId from frontend");

    try {
      // Include company_id in the request body
      const requestData = {
        ...data,
        company_id: companyId  // Add company_id to body instead of query
      };

      console.log("Final request data:", requestData);

      // Remove companyId from query params, send everything in body
      const response = await axiosInstance.post(`/users`, requestData);
      // console.log(response, "create user response");

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Error creating user:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  updateUser: async (id, userData) => {
    try {
      const response = await axiosInstance.post(`/users/${id}`, userData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await axiosInstance.delete(`/users/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },
};
