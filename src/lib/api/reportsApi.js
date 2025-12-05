

import axiosInstance from "../axiosInstance";

export const ReportsApi = {

  getReport: async (endpoint, params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      // Add all params dynamically
      Object.keys(params).forEach((key) => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== "") {
          queryParams.append(key, params[key]);
        }
      });

      const response = await axiosInstance.get(
        `/reports/${endpoint}?${queryParams.toString()}`
      );

      return {
        success: true,
        status: response.data.status,
        data: response.data.data,
        metadata: response.data.metadata,
        count: response.data.count,
      };
    } catch (error) {
      console.error(`Error fetching ${endpoint} report:`, error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  /**
   * Get Zone-wise Report (backward compatibility)
   */
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
   * ✅ NEW: Get Daily Task Report
   */
  getDailyTaskReport: async (params = {}) => {

    console.log("Fetching Daily Task Report with params:", params);

    try {
      const queryParams = new URLSearchParams();

      if (params.company_id) {
        queryParams.append("company_id", params.company_id);
      }
      if (params.location_id) {
        queryParams.append("location_id", params.location_id);
      }
      if (params.cleaner_id) {
        queryParams.append("cleaner_id", params.cleaner_id);
      }
      if (params.start_date) {
        queryParams.append("start_date", params.start_date);
      }
      if (params.end_date) {
        queryParams.append("end_date", params.end_date);
      }
      if (params.status_filter) {
        queryParams.append("status_filter", params.status_filter);
      }

      const response = await axiosInstance.get(
        `/reports/daily-task?${queryParams.toString()}`
      );

      return {
        success: true,
        data: response.data.data,
        metadata: response.data.metadata,
        count: response.data.count,
      };
    } catch (error) {
      console.error("Error fetching daily task report:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },


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
        data: [],
      };
    }
  },


  getLocationsByZone: async (companyId, zoneId) => {
    try {
      const params = new URLSearchParams({
        company_id: companyId,
        ...(zoneId && { type_id: zoneId })
      });

      const response = await fetch(`/api/reports/locations?${params}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching locations by zone:", error);
      throw error;
    }
  },

  getCleanersByLocation: async (companyId, locationId) => {
    try {
      const params = new URLSearchParams({
        company_id: companyId,
        ...(locationId && { location_id: locationId })
      });

      const response = await fetch(`/api/reports/cleaners?${params}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching cleaners by location:", error);
      throw error;
    }
  },

  getLocationsForReport: async (company_id, type_id) => {
    try {
      const response = await axiosInstance.get(
        `/reports/locations?company_id=${company_id}&type_id=${type_id}`
      );

      return {
        success: true,
        data: response.data.data || [],
      };
    } catch (error) {
      console.error("Error fetching locations:", error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  },


  getCleanersForReport: async (company_id, location_id) => {
    try {
      const response = await axiosInstance.get(
        `/reports/cleaners?company_id=${company_id}&location_id=${location_id}`
      );
      return {
        success: true,
        data: response.data.data || [],
      };
    } catch (error) {
      console.error("Error fetching cleaners:", error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  },


  exportCSV: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      Object.keys(params).forEach((key) => {
        if (params[key]) {
          queryParams.append(key, params[key]);
        }
      });

      const response = await axiosInstance.get(
        `/reports/export-csv?${queryParams.toString()}`,
        {
          responseType: "blob",
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      return {
        success: true,
      };
    } catch (error) {
      console.error("Error exporting CSV:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export default ReportsApi;
