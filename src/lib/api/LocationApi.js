import axios from "axios";

import API_BASE_URL from "../utils/Constant";
import axiosInstance from "../axiosInstance";




export const LocationsApi = {
  // Get all locations
  getAllLocations: async (company_id) => {
    console.log("in get all locations", company_id);
    try {
      const response = await axiosInstance.get(`/locations?company_id=${company_id}`);
      // console.log(response.data, "data22");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching locations:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Enhanced method to fetch zones with different grouping options
  fetchZonesWithToilets: async (options = {}) => {
    try {
      const { groupBy = "zone", showCompanyZones = true } = options;

      const params = new URLSearchParams();
      params.append("groupBy", groupBy);
      params.append("showCompanyZones", showCompanyZones.toString());

      const response = await axiosInstance.get(
        `/zones?${params.toString()}`
      );

      console.log(response.data, "zones data");
      return response.data;
    } catch (error) {
      console.error("Error fetching zones with toilets:", error);
      throw error;
    }
  },

  // Get hierarchical location structure starting from a parent
  getHierarchicalLocations: async (parentId = null) => {
    try {
      const params = new URLSearchParams();
      if (parentId) {
        params.append("parentId", parentId);
      }

      const response = await axiosInstance.get(
        `/locations/hierarchy?${params.toString()}`
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching hierarchical locations:", error);
      throw error;
    }
  },

  // Get locations by company
  getLocationsByCompany: async (companyId = null) => {
    try {
      const params = new URLSearchParams();
      if (companyId) {
        params.append("companyId", companyId);
      }

      const response = await axiosInstance.get(
        `/locations/by-company?${params.toString()}`
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching locations by company:", error);
      throw error;
    }
  },

  // Get location types hierarchy
  getLocationTypes: async () => {
    try {
      const response = await axiosInstance.get(`/location-types`);
      return response.data;
    } catch (error) {
      console.error("Error fetching location types:", error);
      throw error;
    }
  },

  postLocation: async (data, companyId) => {
    console.log(data, "posting the data");
    console.log(companyId, 'from location')
    try {
      const response = await axiosInstance.post(`/locations?companyId=${companyId}`, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error posting location:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  updateLocation: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/locations/${id}`, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating location:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  // Get single location by ID
  getLocationById: async (id) => {
    try {
      const response = await axiosInstance.get(
        `/locations/${id}?cb=${Date.now()}`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching location:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};
export default LocationsApi;
