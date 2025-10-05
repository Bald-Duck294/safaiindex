"use client";

import { useEffect, useState } from "react";
// import { fetchToiletFeatures } from "../../lib/api/configurationsApi.js";
import { fetchToiletFeaturesByName } from "@/lib/api/configurationsApi.js";
import DynamicOptions from "./components/DynamicOptions";
// import DynamicOptions from './locationComponents/components/DynamicOptions';
import LocationSearchInput from "./components/LocationSearchInput";
import LocationTypeSelect from "./components/LocationTypeSelect";
import GoogleMapPicker from "./components/GoogleMapPicker";
import LatLongInput from "./components/LatLongInput";
import locationTypesApi from "@/lib/api/locationTypesApi.js";
import LocationsApi from "@/lib/api/LocationApi.js";
import axios from "axios";
import { useCompanyId } from "@/lib/providers/CompanyProvider";
import { useRouter } from "next/navigation";

export default function AddLocationPage() {
  const [features, setFeatures] = useState([]);
  const [locationTypes, setLocationTypes] = useState([]);
  const router = useRouter();

  // const [selectedType, setSelectedType] = useState();

  console.log('add location mounted');
  const { companyId } = useCompanyId();
  const [form, setForm] = useState({
    name: "",
    parent_id: null,
    type_id: null,
    latitude: null,
    longitude: null,
    options: {},
  });


  useEffect(() => {
    async function loadInitialData() {
      console.log(companyId, "companyId from add location");

      if (!companyId || companyId === 'null' || companyId === null) {
        console.log('Skipping - companyId not ready');
        return;
      }

      try {
        // ✅ Handle each API call separately instead of Promise.all
        let config = null;
        let types = null;

        // Try to fetch config (if this fails, continue with types)
        try {
          config = await fetchToiletFeaturesByName("Toilet_Features", companyId);
          console.log('Config loaded successfully:', config);
        } catch (configError) {
          console.error('Failed to load config (continuing anyway):', configError);
          // Don't throw - continue with types
        }

        // Try to fetch types (this is more critical)
        try {
          types = await locationTypesApi.getAll(companyId);
          console.log('Types loaded successfully:', types);
        } catch (typesError) {
          console.error('Failed to load location types:', typesError);
          types = []; // Set empty array as fallback
        }

        // Set state regardless of individual failures
        console.log(config, "config")
        setFeatures(config?.data[0]?.description || []);
        setLocationTypes(Array.isArray(types) ? types : []);

        console.log('Final state:', {
          features: config?.description || [],
          types: types || []
        });

      } catch (err) {
        console.error("Unexpected error in loadInitialData", err);
        // Fallback state
        setFeatures([]);
        setLocationTypes([]);
      }
    }

    loadInitialData();
  }, [companyId]);


  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // const handleSubmit = async (e) => {

  //   e.preventDefault();
  //   console.log("Form Data:", form);

  //   try {
  //     const res = await LocationsApi.postLocation(form);
  //     console.log(res , "form submitted sucessfuly");
  //   } catch (error) {
  //     throw new error();
  //   }
  //   // You’ll connect to POST API here later
  // };

  // console.log(locationTypes , "location types");

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form Data:", form);

    try {
      const res = await LocationsApi.postLocation(form, companyId);
      console.log(res, "form submitted successfully");

      // Redirect to Google Maps in new window
      // const { latitude, longitude } = form;
      // if (latitude && longitude) {
      //   const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      //   window.open(mapUrl, "_blank");
      // }
      console.log(res, "response");
      if (res?.success) {
        router.push(`/washrooms?companyId=${companyId}`)
              // router.push(`/users?companyId=${companyId}`); // ✅ use Next router

      }
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Add New Location</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className="w-full p-2 border rounded"
        />

        {/* <LocationSearchInput
          value={form.parent_id}
          onChange={(id) => handleChange("parent_id", id)}
        /> */}

        <LocationTypeSelect
          types={locationTypes}
          selectedType={form.type_id}
          setSelectedType={(id) => handleChange("type_id", id)} // prop name: setSelectedType
        />

        <GoogleMapPicker
          lat={form.latitude}
          lng={form.longitude}
          onSelect={(lat, lng) => {
            handleChange("latitude", lat);
            handleChange("longitude", lng);
          }}
        />

        <LatLongInput
          lat={form.latitude}
          lng={form.longitude}
          onChange={(lat, lng) => {
            handleChange("latitude", lat);
            handleChange("longitude", lng);
          }}
        />

        <DynamicOptions
          config={features}
          options={form.options}
          setOptions={(opts) => handleChange("options", opts)}
        />

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

