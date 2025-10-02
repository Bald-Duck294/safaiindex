"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { CheckCircle, AlertCircle } from "lucide-react";
import { fetchToiletFeaturesByName } from "@/lib/api/configurationsApi";
import ImageUploader from "../ImageUploader";
import LocationDetector from "../LocationDetector";

// Multilingual support
const translations = {
  en: {
    title: "Submit Cleanliness Review",
    name: "Name",
    phone: "Phone",
    remarks: "Remarks",
    locationId: "Toilet ID",
    submit: "Submit Review",
    submitting: "Submitting...",
    success: "Review submitted successfully!",
    thankYou: "Thank You!",
    successMessage:
      "Your cleanliness review has been submitted successfully. Thank you for helping improve public facilities!",
    submitAnother: "Submit Another Review",
    requiredMsg: "Please fill all required fields",
    noLocationMsg: "Location not detected yet.",
    langLabel: "Language",
    validation: {
      nameRequired: "Name is required",
      nameMaxLength: "Name cannot exceed 100 characters",
      phoneRequired: "Phone number is required",
      phoneInvalid: "Phone number must be exactly 10 digits",
      phoneOnlyNumbers: "Phone number should contain only numbers",
      remarksRequired: "Remarks are required",
      remarksMaxLength: "Remarks cannot exceed 250 characters",
      imagesRequired: "At least one image is required",
      locationRequired: "Location is required",
    },
  },
  hi: {
    title: "स्वच्छता समीक्षा जमा करें",
    name: "नाम",
    phone: "फ़ोन नंबर",
    remarks: "टिप्पणी",
    locationId: "शौचालय आईडी",
    submit: "समीक्षा सबमिट करें",
    submitting: "जमा कर रहे हैं...",
    success: "समीक्षा सफलतापूर्वक जमा हुई!",
    thankYou: "धन्यवाद!",
    successMessage:
      "आपकी स्वच्छता समीक्षा सफलतापूर्वक जमा हो गई है। सार्वजनिक सुविधाओं को बेहतर बनाने में मदद करने के लिए धन्यवाद!",
    submitAnother: "दूसरी समीक्षा जमा करें",
    requiredMsg: "कृपया सभी आवश्यक फ़ील्ड भरें",
    noLocationMsg: "स्थान अभी तक नहीं मिला है।",
    langLabel: "भाषा",
    validation: {
      nameRequired: "नाम आवश्यक है",
      nameMaxLength: "नाम 100 अक्षरों से अधिक नहीं हो सकता",
      phoneRequired: "फ़ोन नंबर आवश्यक है",
      phoneInvalid: "फ़ोन नंबर ठीक 10 अंकों का होना चाहिए",
      phoneOnlyNumbers: "फ़ोन नंबर में केवल संख्याएँ होनी चाहिए",
      remarksRequired: "टिप्पणी आवश्यक है",
      remarksMaxLength: "टिप्पणी 250 अक्षरों से अधिक नहीं हो सकती",
      imagesRequired: "कम से कम एक तस्वीर आवश्यक है",
      locationRequired: "स्थान आवश्यक है",
    },
  },
  mr: {
    title: "स्वच्छता पुनरावलोकन सबमिट करा",
    name: "नाव",
    phone: "फोन नंबर",
    remarks: "टीप",
    locationId: "शौचालय आयडी",
    submit: "पुनरावलोकन सबमिट करा",
    submitting: "सबमिट करत आहोत...",
    success: "पुनरावलोकन यशस्वीरित्या सबमिट झाले!",
    thankYou: "धन्यवाद!",
    successMessage:
      "तुमचे स्वच्छता पुनरावलोकन यशस्वीरित्या सबमिट झाले आहे. सार्वजनिक सुविधा सुधारण्यासाठी मदत केल्याबद्दल धन्यवाद!",
    submitAnother: "दुसरे पुनरावलोकन सबमिट करा",
    requiredMsg: "कृपया सर्व आवश्यक फील्ड भरा",
    noLocationMsg: "स्थान अद्याप शोधले गेले नाही.",
    langLabel: "भाषा",
    validation: {
      nameRequired: "नाव आवश्यक आहे",
      nameMaxLength: "नाव 100 अक्षरांपेक्षा जास्त असू शकत नाही",
      phoneRequired: "फोन नंबर आवश्यक आहे",
      phoneInvalid: "फोन नंबर नक्की 10 अंकांचा असावा",
      phoneOnlyNumbers: "फोन नंबरमध्ये फक्त संख्या असाव्यात",
      remarksRequired: "टीप आवश्यक आहे",
      remarksMaxLength: "टीप 250 अक्षरांपेक्षा जास्त असू शकत नाही",
      imagesRequired: "किमान एक प्रतिमा आवश्यक आहे",
      locationRequired: "स्थान आवश्यक आहे",
    },
  },
};

export default function SubmitReview({ lang = "en" }) {
  const params = useParams();
  const toiletIdFromUrl = params?.id?.toString() || "";

  const [currentLang, setCurrentLang] = useState(lang || "en");
  const [showSuccess, setShowSuccess] = useState(false);
  const [features, setFeatures] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const t = translations[currentLang];

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [remarks, setRemarks] = useState("");
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loder, setLoading] = useState(true);

  // Validation states
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setSelectedLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            address: "",
          });
        },
        (err) => {
          console.warn("Geolocation error:", err);
        }
      );
    }
  }, []);

  useEffect(() => {
    const loadFeatures = async () => {
      try {
        const data = await fetchToiletFeaturesByName("cleaner_config");
        // Assuming data looks like [{ id: 1, description: "Mirror is clean" }, ...]
        console.log(data, "data");
        if (data) {
          setLoading(false);
        }
        setFeatures(data?.description);
      } catch (error) {
        console.error("Failed to fetch features:", error);
      }
    };

    loadFeatures();
  }, []);
  // Validation functions
  const validateName = (value) => {
    if (!value.trim()) {
      return t.validation.nameRequired;
    }
    if (value.length > 100) {
      return t.validation.nameMaxLength;
    }
    return "";
  };

  const validateTasks = (tasks) => {
    if (!tasks || tasks.length === 0) {
      return "Please select at least one checklist item.";
    }
    return "";
  };

  const validatePhone = (value) => {
    if (!value.trim()) {
      return t.validation.phoneRequired;
    }
    if (!/^\d+$/.test(value)) {
      return t.validation.phoneOnlyNumbers;
    }
    if (value.length !== 10) {
      return t.validation.phoneInvalid;
    }
    return "";
  };

  const validateRemarks = (value) => {
    if (!value.trim()) {
      return t.validation.remarksRequired;
    }
    if (value.length > 250) {
      return t.validation.remarksMaxLength;
    }
    return "";
  };

  const validateImages = (imageArray) => {
    if (!imageArray || imageArray.length === 0) {
      return t.validation.imagesRequired;
    }
    return "";
  };

  const validateLocation = (location) => {
    if (!location) {
      return t.validation.locationRequired;
    }
    return "";
  };

  // Real-time validation
  useEffect(() => {
    const newErrors = {};

    if (touched.name) {
      const nameError = validateName(name);
      if (nameError) newErrors.name = nameError;
    }

    if (touched.phone) {
      const phoneError = validatePhone(phone);
      if (phoneError) newErrors.phone = phoneError;
    }
    if (touched.tasks) {
      const tasksError = validateTasks(selectedTasks);
      if (tasksError) newErrors.tasks = tasksError;
    }

    if (touched.remarks) {
      const remarksError = validateRemarks(remarks);
      if (remarksError) newErrors.remarks = remarksError;
    }

    if (touched.images) {
      const imagesError = validateImages(images);
      if (imagesError) newErrors.images = imagesError;
    }

    if (touched.location) {
      const locationError = validateLocation(selectedLocation);
      if (locationError) newErrors.location = locationError;
    }

    setErrors(newErrors);
  }, [name, phone, remarks, images, selectedLocation, touched, t.validation]);

  // Check if form is valid
  const isFormValid = () => {
    const nameError = validateName(name);
    const phoneError = validatePhone(phone);
    const remarksError = validateRemarks(remarks);
    const imagesError = validateImages(images);
    const locationError = validateLocation(selectedLocation);

    return (
      !nameError &&
      !phoneError &&
      !remarksError &&
      !imagesError &&
      !locationError
    );
  };

  useEffect(() => {
    console.log("Component mounted");
  }, []);

  const handleNameChange = (e) => {
    const value = e.target.value;
    // Allow only up to 100 characters
    console.log("HandleNameChange:", e.target.value);

    console.log(value, "value");
    if (value.length <= 100) {
      setName(value);
    }
    setTouched((prev) => ({ ...prev, name: true }));
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and up to 10 digits
    if (/^\d{0,10}$/.test(value)) {
      setPhone(value);
    }
    setTouched((prev) => ({ ...prev, phone: true }));
  };

  const handleRemarksChange = (e) => {
    const value = e.target.value;
    // Allow only up to 250 characters
    if (value.length <= 250) {
      setRemarks(value);
    }
    setTouched((prev) => ({ ...prev, remarks: true }));
  };

  const handleImagesChange = (newImages) => {
    setImages(newImages);
    setTouched((prev) => ({ ...prev, images: true }));
  };

  const handleLocationChange = (newLocation) => {
    setSelectedLocation(newLocation);
    setTouched((prev) => ({ ...prev, location: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched to show validation errors
    setTouched({
      name: true,
      phone: true,
      remarks: true,
      images: true,
      location: true,
      tasks: true,
    });

    if (!isFormValid()) {
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("name", name);
      formData.append("site_id", toiletIdFromUrl);
      formData.append("phone", phone);
      formData.append("remarks", remarks);
      formData.append("latitude", selectedLocation.latitude.toString());
      formData.append("longitude", selectedLocation.longitude.toString());
      formData.append("address", selectedLocation.address || "");
      images.forEach((img) => formData.append("images", img));
      selectedTasks.forEach((taskId) => formData.append("task_ids", taskId));
      console.log(formData, "form data");
      console.log(selectedTasks, "selected task");
      const res = await fetch(
        "https://safai-index-backend.onrender.com/api/cleaner-reviews",
        {
          method: "POST",
          body: formData,
        }
      );

      console.log(res, "response");
      if (!res.ok) throw new Error("Failed to submit review");

      setShowSuccess(true);

      // // Reset form
      // setName("");
      // setPhone("");
      // setRemarks("");
      // setImages([]);
      // setSelectedLocation(null);
      // setTouched({});
      // setErrors({});
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t.thankYou}
          </h2>
          <p className="text-gray-600 mb-8 text-lg">{t.successMessage}</p>
          <button
            onClick={() => setShowSuccess(false)}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {t.submitAnother}
          </button>
        </div>
      </div>
    );
  }

  if (loder) {
    return <div>loading ....</div>;
  }
  // console.log(errors, "errors");
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white shadow-xl rounded-lg w-full max-w-2xl p-6 sm:p-8 space-y-6">
        {/* Language Selector */}
        <div className="flex justify-end">
          <label className="mr-2 text-sm font-medium text-gray-700">
            {t.langLabel}:
          </label>
          <select
            value={currentLang}
            onChange={(e) => setCurrentLang(e.target.value)}
            className="border px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="mr">मराठी</option>
          </select>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center">
          {t.title}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Location Detector */}
          <div>
            <LocationDetector
              location={selectedLocation}
              onLocationChange={handleLocationChange}
            />
            {errors.location && touched.location && (
              <div className="flex items-center mt-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.location}
              </div>
            )}
          </div>

          {/* Name Field */}
          <div>
            <label className="block font-medium text-sm text-gray-700">
              {t.name} *
            </label>
            <input
              name="name"
              value={name}
              onChange={handleNameChange}
              onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
              className={`mt-1 w-full text-black px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                errors.name && touched.name
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="Enter your full name"
            />
            <div className="flex justify-between mt-1">
              {errors.name && touched.name && (
                <div className="flex items-center text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.name}
                </div>
              )}
              <div className="text-xs text-gray-500 ml-auto">
                {name.length}/100
              </div>
            </div>
          </div>

          {/* Toilet ID Field */}
          <div>
            <label className="block font-medium text-sm text-gray-700">
              {t.locationId} *
            </label>
            <input
              type="number"
              name="site_id"
              value={toiletIdFromUrl}
              readOnly
              className="mt-1 text-black w-full px-3 py-2 border rounded-md bg-gray-100  shadow-sm"
            />
          </div>

          {/* Phone Field */}
          <div>
            <label className="block font-medium text-sm text-gray-700">
              {t.phone} *
            </label>
            <input
              name="phone"
              type="number"
              value={phone}
              onChange={handlePhoneChange}
              onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
              className={`mt-1 w-full px-3 py-2 text-black border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                errors.phone && touched.phone
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="Enter 10-digit phone number"
            />
            <div className="flex justify-between mt-1">
              {errors.phone && touched.phone && (
                <div className="flex items-center text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.phone}
                </div>
              )}
              <div className="text-xs text-gray-500 ml-auto">
                {phone.length}/10
              </div>
            </div>
          </div>

          {/* Remarks Field */}
          <div>
            <label className="block font-medium text-sm text-gray-700">
              {t.remarks} *
            </label>
            <textarea
              name="remarks"
              rows={3}
              value={remarks}
              onChange={handleRemarksChange}
              onBlur={() => setTouched((prev) => ({ ...prev, remarks: true }))}
              className={`mt-1 text-black w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 resize-none ${
                errors.remarks && touched.remarks
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="Share your experience and observations"
            />
            <div className="flex justify-between mt-1">
              {errors.remarks && touched.remarks && (
                <div className="flex items-center text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.remarks}
                </div>
              )}
              <div className="text-xs text-black ml-auto">
                {remarks.length}/250
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div>
            <label className="block font-medium text-sm text-gray-700 mb-2">
              Checklist *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features?.map((feature, idx) => (
                <label key={idx} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={feature.id}
                    checked={selectedTasks.includes(feature.id)}
                    onChange={(e) => {
                      const taskId = feature.id;
                      setSelectedTasks((prev) =>
                        e.target.checked
                          ? [...prev, taskId]
                          : prev.filter((id) => id !== taskId)
                      );
                    }}
                    className="form-checkbox text-blue-600"
                  />
                  <span className="text-black">{feature.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <ImageUploader
              images={images}
              onImagesChange={handleImagesChange}
              maxImages={3}
              maxSizeKB={300}
            />
            {errors.images && touched.images && (
              <div className="flex items-center mt-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.images}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !isFormValid()}
            className={`w-full font-semibold py-3 px-4 rounded-md shadow-md transition duration-200 ${
              submitting || !isFormValid()
                ? "bg-gray-400 cursor-not-allowed text-gray-600"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {submitting ? t.submitting : t.submit}
          </button>
        </form>
      </div>
    </div>
  );
}
