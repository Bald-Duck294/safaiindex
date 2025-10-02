import axiosInstance from "../axiosInstance";
const API_BASE_URL = "http://localhost:8000/api";

export const RegisteredUsersApi = {
    // Get all registered users
    getAllRegisteredUsers: async (companyId = null) => {
        try {
            const url = companyId
                ? `${API_BASE_URL}/registered-users?company_id=${companyId}`
                : `${API_BASE_URL}/registered-users`;

            const response = await axiosInstance.get(url);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || error.message
            };
        }
    },

    // Create new registered user
    createRegisteredUser: async (userData) => {
        try {
            const response = await axiosInstance.post(`${API_BASE_URL}/registered-users`, userData);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || error.message
            };
        }
    },

    // Verify phone number
    verifyPhone: async (phone) => {
        try {
            const response = await axiosInstance.post(`${API_BASE_URL}/auth/verify-phone`, { phone });
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || error.message
            };
        }
    },

    // Set password
    setPassword: async (passwordData) => {
        try {
            const response = await axiosInstance.post(`${API_BASE_URL}/auth/set-password`, passwordData);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || error.message
            };
        }
    }
};
