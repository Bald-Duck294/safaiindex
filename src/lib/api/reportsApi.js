// import axiosInstance from "./axiosInstance";
import axiosInstance from "../axiosInstance";

export const ReportsApi = {

  getZoneWiseReport: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.company_id) {
        queryParams.append("company_id", params.company_id);
      }
      if (params.type_id) {
        queryParams.append("type_id", params.type_id);
      }
      if (params.start_date) {
        queryParams.append("start_date", params.start_date);
      }
      if (params.end_date) {
        queryParams.append("end_date", params.end_date);
      }
      if (params.review_filter) {
        queryParams.append("review_filter", params.review_filter);
      }
      if (params.fields) {
        queryParams.append("fields", params.fields.join(","));
      }

      const response = await axiosInstance.get(
        `/reports/zone-wise?${queryParams.toString()}`
      );

      return {
        success: true,
        data: response.data.data,
        metadata: response.data.metadata,
      };
    } catch (error) {
      console.error("Error fetching zone-wise report:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  /**
   * Get available zones
   */
  getAvailableZones: async (company_id) => {
    try {
      const response = await axiosInstance.get(
        `/reports/zones?company_id=${company_id}`
      );

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Error fetching zones:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export default ReportsApi;
