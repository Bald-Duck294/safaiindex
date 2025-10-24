"use client";

import { useEffect, useState, useRef } from "react";
import { fetchToiletFeaturesByName } from "@/lib/api/configurationsApi.js";
import DynamicOptions from "./components/DynamicOptions";
import LocationSearchInput from "./components/LocationSearchInput";
import LocationTypeSelect from "./components/LocationTypeSelect";
import GoogleMapPicker from "./components/GoogleMapPicker";
import LatLongInput from "./components/LatLongInput";
import locationTypesApi from "@/lib/api/locationTypesApi.js";
import LocationsApi from "@/lib/api/LocationApi.js";
import { useCompanyId } from "@/lib/providers/CompanyProvider";
import { useRouter } from "next/navigation";
import { Upload, X, Image as ImageIcon, Plus, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function AddLocationPage() {
  const [features, setFeatures] = useState([]);
  const [locationTypes, setLocationTypes] = useState([]);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const fileInputRef = useRef(null);
  const router = useRouter();

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
        let config = null;
        let types = null;

        try {
          config = await fetchToiletFeaturesByName("Toilet_Features", companyId);
          console.log('Config loaded successfully:', config);
        } catch (configError) {
          console.error('Failed to load config (continuing anyway):', configError);
        }

        try {
          types = await locationTypesApi.getAll(companyId);
          console.log('Types loaded successfully:', types);
        } catch (typesError) {
          console.error('Failed to load location types:', typesError);
          types = [];
        }

        console.log(config, "config")
        setFeatures(config?.data[0]?.description || []);
        setLocationTypes(Array.isArray(types) ? types : []);

        console.log('Final state:', {
          features: config?.description || [],
          types: types || []
        });

      } catch (err) {
        console.error("Unexpected error in loadInitialData", err);
        setFeatures([]);
        setLocationTypes([]);
      }
    }

    loadInitialData();
  }, [companyId]);

  // ✅ Handle image file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    // Validate file types and sizes
    const validFiles = [];
    const invalidFiles = [];

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        if (file.size <= 10 * 1024 * 1024) { // 10MB limit
          validFiles.push(file);
        } else {
          invalidFiles.push(file.name + ' (too large)');
        }
      } else {
        invalidFiles.push(file.name + ' (not an image)');
      }
    });

    if (invalidFiles.length > 0) {
      toast.error(`Invalid files: ${invalidFiles.join(', ')}`);
    }

    if (validFiles.length > 0) {
      // Add to images array
      setImages(prev => [...prev, ...validFiles]);

      // Create preview URLs
      const newPreviews = validFiles.map(file => ({
        file,
        url: URL.createObjectURL(file),
        name: file.name
      }));

      setPreviewImages(prev => [...prev, ...newPreviews]);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ✅ Remove image from selection
  const removeImage = (index) => {
    // Revoke preview URL to free memory
    URL.revokeObjectURL(previewImages[index].url);

    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  // ✅ Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // ✅ Updated submit handler with image support
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.type_id) {
      toast.error("Please fill in the required fields (Name and Location Type)");
      return;
    }

    console.log("Form Data:", form);
    console.log("Images:", images);

    setUploading(true);

    try {
      const res = await LocationsApi.postLocation(form, companyId, images);
      console.log(res, "form submitted successfully");

      if (res?.success) {
        toast.success("Location added successfully!");

        // Clean up preview URLs
        previewImages.forEach(preview => {
          URL.revokeObjectURL(preview.url);
        });

        router.push(`/washrooms?companyId=${companyId}`);
      } else {
        toast.error(res?.error || "Failed to add location");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to add location. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Clean up preview URLs on unmount
  useEffect(() => {
    return () => {
      previewImages.forEach(preview => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100   p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white  rounded-2xl shadow-xl border border-slate-200  overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
            <h1 className="text-2xl font-bold text-white mb-2">Add New Location</h1>
            {/* <p className="text-blue-100">Create a new toilet location with details and images</p> */}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700  mb-2">
                  Location Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter location name"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full p-3 border border-slate-300  rounded-xl bg-white  text-slate-700  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700  mb-2">
                  Location Type <span className="text-red-500">*</span>
                </label>
                <LocationTypeSelect
                  types={locationTypes}
                  selectedType={form.type_id}
                  setSelectedType={(id) => handleChange("type_id", id)}
                />
              </div>
            </div>

            {/* Location Coordinates */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 ">
                Location Coordinates
              </h3>

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
            </div>

            {/* ✅ Image Upload Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800  flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Location Images
              </h3>

              {/* Upload Area */}
              <div className="border-2 border-dashed border-slate-300  rounded-xl p-6 text-center hover:border-blue-400 transition-colors duration-200">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="space-y-4">
                  <div className="w-16 h-16 bg-blue-100  rounded-full flex items-center justify-center mx-auto">
                    <Upload className="h-8 w-8 text-blue-600 " />
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                    >
                      <Plus className="h-4 w-4" />
                      Choose Images
                    </button>
                    <p className="text-sm text-slate-500  mt-2">
                      Select multiple images (max 10MB each)
                    </p>
                  </div>
                </div>
              </div>

              {/* Image Previews */}
              {previewImages.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-slate-700 ">
                    Selected Images ({previewImages.length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {previewImages.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview.url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-slate-200 "
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="absolute bottom-1 left-1 right-1">
                          <p className="text-xs text-white bg-black bg-opacity-50 rounded px-1 py-0.5 truncate">
                            {preview.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dynamic Options */}
            {features.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 ">
                  Additional Features
                </h3>
                <DynamicOptions
                  config={features}
                  options={form.options}
                  setOptions={(opts) => handleChange("options", opts)}
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200 ">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 text-slate-600  hover:bg-slate-100  rounded-xl font-medium transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading || !form.name || !form.type_id || !form.latitude || !form.longitude}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors duration-200 flex items-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed min-w-32"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 cursor-pointer" />
                    Create Location
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
