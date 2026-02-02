import axios from "axios";

import API_BASE_URL from "../utils/Constant";
import axiosInstance from "../axiosInstance";
import { success } from "zod";
import { parseParameter } from "next/dist/shared/lib/router/utils/route-regex";


export const LocationsApi = {
  // Get all locations
  getAllLocations: async (company_id, includeUnavailable = false, facilityCompanyId = null) => {
    // console.log("in get all locations", company_id);
    // options = {} add this in the parametere if the options becomes more 
    // const { includeUnavailable = false, type_id = null } = options; this is how to acesses it 

    const params = { company_id };

    if (includeUnavailable) {
      params.include_unavailable = true;
    }

    if (facilityCompanyId) {
      params.facilityCompanyId = facilityCompanyId
    }
    // if (type_id) {
    //   params.type_id = type_id;
    // }

    // console.log(params, "from get all locs");
    try {
      const response = await axiosInstance.get(`/locations`, { params });
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

      // console.log(response.data, "zones data");
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

  // ✅ Fixed postLocation in LocationsApi.js
  // postLocation: async (data, companyId, images = []) => {
  //   console.log("=== LOCATION API DEBUG ===");
  //   console.log("Input data:", data);
  //   console.log("Input data options:", data.options);
  //   console.log("Input data options type:", typeof data.options);

  //   try {
  //     const formData = new FormData();

  //     // ✅ FIXED: Properly handle all fields
  //     Object.keys(data).forEach(key => {
  //       if (data[key] !== null && data[key] !== undefined) {
  //         let valueToAppend = data[key];

  //         // ✅ Special handling for different data types
  //         if (key === 'options') {
  //           console.log(`Processing options:`, data[key]);
  //           console.log(`Options type:`, typeof data[key]);

  //           if (typeof data[key] === 'object' && data[key] !== null) {
  //             // ✅ CRITICAL FIX: Always stringify objects
  //             valueToAppend = JSON.stringify(data[key]);
  //             console.log(`Stringified options:`, valueToAppend);
  //           } else if (typeof data[key] === 'string') {
  //             valueToAppend = data[key]; // Already a string
  //           } else {
  //             valueToAppend = JSON.stringify(data[key] || {});
  //           }
  //         } else if (key === 'latitude' || key === 'longitude') {
  //           // Handle coordinates
  //           const numValue = parseFloat(data[key]);
  //           if (!isNaN(numValue)) {
  //             valueToAppend = numValue.toString();
  //           } else {
  //             valueToAppend = null;
  //           }
  //         } else if (typeof data[key] === 'object' && data[key] !== null) {
  //           // ✅ Handle any other objects by stringifying them
  //           valueToAppend = JSON.stringify(data[key]);
  //         }

  //         // Only append if we have a valid value
  //         if (valueToAppend !== null && valueToAppend !== undefined) {
  //           formData.append(key, valueToAppend);
  //         }
  //       }
  //     });

  //     // Add image files
  //     if (images && images.length > 0) {
  //       images.forEach((image) => {
  //         formData.append('images', image);
  //       });
  //     }

  //     // ✅ Debug FormData contents
  //     console.log("=== FORMDATA CONTENTS ===");
  //     for (let pair of formData.entries()) {
  //       console.log(`${pair[0]}: ${pair[1]} (type: ${typeof pair[1]})`);
  //     }

  //     const response = await axiosInstance.post(
  //       `/locations?companyId=${companyId}`,
  //       formData,
  //       {
  //         headers: {
  //           'Content-Type': 'multipart/form-data',
  //         },
  //       }
  //     );

  //     return {
  //       success: true,
  //       data: response.data,
  //     };
  //   } catch (error) {
  //     console.error("Error posting location:", error);
  //     return {
  //       success: false,
  //       error: error.response?.data?.error || error.message,
  //     };
  //   }
  // },


  postLocation: async (data, companyId, images = [], user) => {
    console.log("=== LOCATION API DEBUG ===");
    console.log("Input data:", data);
    // console.log(user?.role?.name, "role")
    try {
      const formData = new FormData();

      // ✅ Add all form fields
      const fieldsToSend = [
        'name', 'parent_id', 'type_id', 'latitude', 'longitude',
        'address', 'pincode', 'state', 'city', 'dist', 'status', 'options'
        , 'facility_company_id', 'no_of_photos', 'usage_category',
      ];

      fieldsToSend.forEach(key => {
        if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
          let valueToAppend = data[key];

          if (key === 'options' || key === 'usage_category') {
            valueToAppend = typeof data[key] === 'object'
              ? JSON.stringify(data[key])
              : data[key];
          } else if (key === 'latitude' || key === 'longitude') {
            const numValue = parseFloat(data[key]);
            valueToAppend = !isNaN(numValue) ? numValue.toString() : null;
          } else if (key === 'status') {
            valueToAppend = data[key].toString(); // Convert boolean to string
          }

          if (valueToAppend !== null && valueToAppend !== undefined) {
            formData.append(key, valueToAppend);
          }
        }
      });

      // Add image files
      if (images && images.length > 0) {
        images.forEach((image) => {
          formData.append('images', image);
        });
      }

      console.log("=== FORMDATA CONTENTS ===");
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      if (user) {
        formData.append('user_id', user?.id)
        formData.append('role_name', user?.role?.name);
        formData.append('role_id', user?.role?.id);
      }
      const response = await axiosInstance.post(
        `/locations?companyId=${companyId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error posting location:", error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  },

  updateLocation: async (id, data, companyId = null, images = [], replaceImages = false) => {
    try {
      const formData = new FormData();


      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          let valueToAppend = data[key];

          if (key === 'options' | key === 'usage_category') {
            // console.log(`Processing options for update:`, data[key]);

            if (typeof data[key] === 'object' && data[key] !== null) {
              // ✅ CRITICAL FIX: Always stringify objects
              valueToAppend = JSON.stringify(data[key]);
              // console.log(`Stringified options for update:`, valueToAppend);
            } else if (typeof data[key] === 'string') {
              valueToAppend = data[key];
            } else {
              valueToAppend = JSON.stringify(data[key] || {});
            }
          } else if (typeof data[key] === 'object' && data[key] !== null) {
            valueToAppend = JSON.stringify(data[key]);
          }

          if (valueToAppend !== null && valueToAppend !== undefined) {
            formData.append(key, valueToAppend);
          }
        }
      });

      // Add image files
      if (images && images.length > 0) {
        images.forEach((image) => {
          formData.append('images', image);
        });
      }

      // Add replace_images flag
      if (replaceImages) {
        formData.append('replace_images', 'true');
      }

      const params = new URLSearchParams();
      if (companyId) {
        params.append('companyId', companyId);
      }

      //  Debug FormData contents
      // console.log("Update FormData entries:");
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]} (type: ${typeof pair[1]})`);
      }

      const response = await axiosInstance.post(
        `/locations/update/${id}?${params.toString()}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating location:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },


  // ✅ Updated updateLocation with image support


  // ✅ New method to delete specific images
  deleteLocationImage: async (locationId, imageUrl, companyId = null) => {
    try {
      const params = new URLSearchParams();
      if (companyId) {
        params.append('companyId', companyId);
      }

      const response = await axiosInstance.delete(
        `/locations/${locationId}/image?${params.toString()}`,
        {
          data: { imageUrl }
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error deleting location image:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  deleteLocation: async (id, companyId = null, softDelete = false) => {
    try {
      const params = new URLSearchParams();
      if (companyId) {
        params.append('companyId', companyId);
      }
      if (softDelete) {
        params.append('soft', 'true');
      }

      const response = await axiosInstance.delete(
        `/locations/${id}?${params.toString()}`
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error deleting location:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },


  searchLocations: async (query, companyId) => {
    try {
      const params = new URLSearchParams({
        search: query,
        company_id: companyId,
        cb: Date.now()
      });

      const response = await axiosInstance.get(
        `/locations/search?${params.toString()}`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error searching locations:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Get single location by ID
  getLocationById: async (id, companyId = null) => {
    try {
      const params = new URLSearchParams({ cb: Date.now() });
      if (companyId) {
        params.append('companyId', companyId);
      }

      const response = await axiosInstance.get(
        `/locations/${id}?${params.toString()}`
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

  // Add new method to get all locations for prev/next navigation
  getAllLocationNames: async (companyId) => {
    try {
      const response = await axiosInstance.get(
        `/locations?companyId=${companyId}&fields=id,name&cb=${Date.now()}`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching location names:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },


  // ✅ Helper method to create FormData from data and images
  createFormData: (data, images = []) => {
    const formData = new FormData();

    // Add text fields
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        // Handle arrays and objects
        if (typeof data[key] === 'object' && !Array.isArray(data[key])) {
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, data[key]);
        }
      }
    });

    // Add image files
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append('images', image);
      });
    }

    return formData;
  },

  // toggleStautsLocations: async (id) => {
  //   try {
  //     const data = await axiosInstance.post(`/locations/status/${id}`,)
  //     return {
  //       success: true,
  //       data: data
  //     }
  //   }
  //   catch (err) {
  //     console.log(err)
  //     return {
  //       success: false,
  //       data: err
  //     }
  //   }

  // }
  // In LocationsApi.js
  toggleStautsLocations: async (id) => {
    try {
      // console.log('Calling toggle status API for ID:', id);
      const response = await axiosInstance.post(`/locations/status/${id}`);

      // console.log('Raw API response:', response);
      // console.log('Response data:', response.data);

      return {
        success: true,
        data: response.data
      };
    } catch (err) {
      console.error('API error:', err);
      console.error('Error response:', err.response?.data);
      return {
        success: false,
        error: err.response?.data?.message || err.message
      };
    }
  }

};
export default LocationsApi;
