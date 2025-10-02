import axios from "axios";
import { Thermometer } from "lucide-react";
import API_BASE_URL from "../utils/Constant";
import axiosInstance from "../axiosInstance";
// export const fetchToiletFeatures = async () => {
//   try {
// const res =  await axios('http://localhost:8000/api/configurations/:Toilet_Features') //for now it is hardcoded 

// return res.data

// } catch (error) {

//     console.log(error , "error");
// //  throw new error;
// return error;
// }
// };


// lib/api/configurationsApi.js
// import axios from 'axios';

export const fetchToiletFeaturesByName = async (name) => {
  const res = await axiosInstance.get(`${API_BASE_URL}/configurations/${name}`);
  return res.data;
};

export const fetchToiletFeaturesById = async (id) => {
  console.log('config id ' , id)
  const res = await axiosInstance.get(`${API_BASE_URL}/configurations/id/${id}`);
  return res.data;
};

