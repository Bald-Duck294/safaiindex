import axios from "axios";
import API_BASE_URL from "../utils/Constant";
// const BASE = '/api/location-types';
// const BASE = `${API_BASE_URL}/location-types?`;

const BASE = `location-types`;
import axiosInstance from "../axiosInstance";

const locationTypesApi = {
  getAll: async (companyId) => {
    console.log(companyId, "company Id from get all location")
    const res = await axiosInstance.get(`${BASE}?companyId=${companyId}`);
    return res.data;
  },
  create: async (data, companyId) => {
    console.log(data, companyId, "data ");
    const res = await axiosInstance.post(`${BASE}?companyId=${companyId}`, data);
    return res.data;
  },
  //   update: async (id, data) => {
  //     console.log(data, id, "update");
  //     const res = await axios.patch(`${BASE}/${id}`, data);
  //     return res.data;
  //   },
  // update: async (id, body) => {
  //   console.log('update' , id , body);
  //   const res = await axiosInstance.patch(`${BASE}/${id}`, {
  //     method: "PATCH",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(body),
  //   });
  //   return res;
  // },

  update: async (id, data, companyId) => {
    console.log("update", id, data);
    const res = await axiosInstance.patch(`${BASE}/${id}`, data);
    console.log(res, "response from the location types")
    return res;
  },
  updateParent: async (id, data) => {
    const res = await axiosInstance.patch(`${BASE}/${id}`, data);
    return res.data;
  },
  markAsToilet: async (id) => {
    const res = await axiosInstance.patch(`${BASE}/${id}/mark-toilet`);
    return res.data;
  },
};

export default locationTypesApi;
