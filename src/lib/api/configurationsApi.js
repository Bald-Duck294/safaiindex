import axios from "axios";
import { Thermometer } from "lucide-react";
import API_BASE_URL from "../utils/Constant";
import axiosInstance from "../axiosInstance";


// export const fetchToiletFeaturesByName = async (name) => {
//   const res = await axiosInstance.get(`/configurations/${name}`);
//   return res.data;
// };

// export const fetchToiletFeaturesById = async (id) => {
//   console.log('config id ' , id)
//   const res = await axiosInstance.get(`/configurations/id/${id}`);
//   return res.data;
// };




// Update your configurations API to handle toilet features better

export const fetchToiletFeaturesByName = async (name) => {
  try {
    const res = await axiosInstance.get(`/configurations/${name}`);

    // Parse the configuration value if it's a JSON string
    if (res.data && res.data.value) {
      try {
        const parsedValue = typeof res.data.value === 'string' 
          ? JSON.parse(res.data.value) 
          : res.data.value;
        return parsedValue;
      } catch (parseError) {
        console.error('Error parsing configuration value:', parseError);
        return [];
      }
    }

    return res.data || [];
  } catch (error) {
    console.error('Error fetching toilet features:', error);
    return [];
  }
};

export const fetchToiletFeaturesById = async (id) => {
  try {
    console.log('config id', id);
    const res = await axiosInstance.get(`/configurations/id/${id}`);

    // Parse the configuration value if it's a JSON string
    if (res.data && res.data.value) {
      try {
        const parsedValue = typeof res.data.value === 'string' 
          ? JSON.parse(res.data.value) 
          : res.data.value;
        return parsedValue;
      } catch (parseError) {
        console.error('Error parsing configuration value:', parseError);
        return [];
      }
    }

    return res.data || [];
  } catch (error) {
    console.error('Error fetching toilet features by id:', error);
    return [];
  }
};
