import axiosInstance from "../axiosInstance";
export const FacilityCompanyApi = {

  getAll: async (company_id, includeInactive = false) => {
    try {
      const params = new URLSearchParams();
      params.append("company_id", company_id);

      if (includeInactive) {
        params.append("include_inactive", "true");
      }

      const response = await axiosInstance.get(
        `/facility-companies?${params.toString()}`
      );

      return {
        success: true,
        data: response.data.data,
        count: response.data.count,
      };
    } catch (error) {
      console.error("Error fetching facility companies:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: [],
      };
    }
  },


  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/facility-companies/${id}`);

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Error fetching facility company:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },


  create: async (data) => {
    try {
      const response = await axiosInstance.post("/facility-companies", data);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error creating facility company:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },


  update: async (id, data) => {
    try {
      const response = await axiosInstance.put(
        `/facility-companies/${id}`,
        data
      );

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error updating facility company:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },


  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/facility-companies/${id}`);

      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error deleting facility company:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  /**
   * Toggle facility company status (active/inactive)
   * @param {string|number} id - Facility company ID
   */
  toggleStatus: async (id) => {
    try {
      const response = await axiosInstance.patch(
        `/facility-companies/${id}/toggle-status`
      );

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error toggling facility company status:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },
};

export default FacilityCompanyApi;
