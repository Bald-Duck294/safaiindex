"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCreateShiftMutation } from "@/store/slices/shiftApi";
import Loader from "@/components/ui/Loader";
import toast, { Toaster } from "react-hot-toast";
import { useCompanyId } from "@/lib/providers/CompanyProvider";


export default function CreateShift() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { companyId } = useCompanyId();
  const [createShift, { isLoading }] = useCreateShiftMutation();


  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startTime: "09:00",
    endTime: "17:00",
    effectiveFrom: new Date().toISOString().split("T")[0],
    effectiveUntil: "",
    company_id: companyId,
  });


  const [durationHours, setDurationHours] = useState(8);
  const [errors, setErrors] = useState({});


  // ✅ Helper function to convert 24-hour to 12-hour format
  const formatTo12Hour = (timeStr) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const paddedHours = displayHours < 10 ? `0${displayHours}` : displayHours;
    return `${paddedHours}:${String(minutes).padStart(2, "0")} ${period}`;
  };


  // ✅ Helper function to convert 12-hour format to 24-hour
  const convertTo24Hour = (hours, minutes, period) => {
    let h = parseInt(hours);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };


  // ✅ Helper function to parse time string to hours, minutes, period
  const parseTime12Hour = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return {
      hours: String(displayHours).padStart(2, "0"),
      minutes: String(minutes).padStart(2, "0"),
      period: period,
    };
  };


  // ✅ Generate hours array for start and end times
  const getHoursArray = (isStartTime) => {
    return Array.from({ length: 12 }, (_, i) => {
      const hour = i + 1;
      return String(hour).padStart(2, "0");
    });
  };


  // ✅ Generate minutes array
  const getMinutesArray = () => {
    return Array.from({ length: 60 }, (_, i) =>
      String(i).padStart(2, "0")
    );
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };


  // ✅ Handle time change with custom dropdowns - UPDATED with AM/PM
  const handleTimeSelectChange = (field, type, value) => {
    const currentTime = field === "startTime" ? formData.startTime : formData.endTime;
    const [currentHours, currentMinutes] = currentTime.split(":").map(Number);
    const currentPeriod = currentHours >= 12 ? "PM" : "AM";
    const currentDisplayHours = currentHours % 12 || 12;


    let newHours = currentDisplayHours;
    let newMinutes = currentMinutes;
    let newPeriod = currentPeriod;


    if (type === "hours") {
      newHours = parseInt(value);
    } else if (type === "minutes") {
      newMinutes = parseInt(value);
    } else if (type === "period") {
      newPeriod = value;
    }


    const time24Hour = convertTo24Hour(newHours, newMinutes, newPeriod);


    // ✅ Calculate duration BEFORE setting state
    const parseTime = (timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 3600 + minutes * 60;
    };


    const startTime = field === "startTime" ? time24Hour : formData.startTime;
    const endTime = field === "endTime" ? time24Hour : formData.endTime;


    let startSec = parseTime(startTime);
    let endSec = parseTime(endTime);


    if (endSec <= startSec) {
      endSec += 24 * 3600;
    }


    const duration = (endSec - startSec) / 3600;


    // ✅ Update both formData and duration at the same time
    setFormData((prev) => ({ ...prev, [field]: time24Hour }));
    setDurationHours(parseFloat(duration.toFixed(2)));
  };




  const validateForm = () => {
    const newErrors = {};


    if (!formData.name.trim()) {
      newErrors.name = "Shift name is required";
    }
    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }
    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    }
    if (
      formData.startTime &&
      formData.endTime &&
      formData.startTime === formData.endTime
    ) {
      newErrors.endTime = "End time must be different from start time";
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      await createShift({
        name: formData.name.trim(),
        description: formData.description.trim(),
        startTime: formData.startTime,  // ✅ Send as "09:00" (HH:MM format)
        endTime: formData.endTime,      // ✅ Send as "17:00" (HH:MM format)
        effectiveFrom: formData.effectiveFrom,
        effectiveUntil: formData.effectiveUntil || null,
        company_id: companyId,
      }).unwrap();

      toast.success("Shift created successfully 🎉");
      router.push(`/shifts?companyId=${companyId}`);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create shift");
      console.error("Error:", error);
    }
  };



  // ✅ Get current values
  const startTimeParts = parseTime12Hour(formData.startTime);
  const endTimeParts = parseTime12Hour(formData.endTime);


  return (


    <>
      <Toaster />


      <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="cursor-pointer text-blue-600 hover:text-blue-900 mb-4 font-medium"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Create New Shift</h1>
            <p className="mt-2 text-sm text-gray-600">Add a new shift to your company</p>
          </div>


          {/* Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shift Name */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Shift Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Morning Shift"
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
              </div>


              {/* Description - COMMENTED OUT */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Shift description (optional)"
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div> */}


              {/* Time Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Shift Timing</h3>


                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* Start Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Start Time *
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={startTimeParts.hours}
                        onChange={(e) =>
                          handleTimeSelectChange("startTime", "hours", e.target.value)
                        }
                        className={`flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${errors.startTime ? "border-red-500" : "border-gray-300"
                          }`}
                      >
                        {getHoursArray(true).map((hour) => (
                          <option key={hour} value={hour}>
                            {hour}
                          </option>
                        ))}
                      </select>


                      <select
                        value={startTimeParts.minutes}
                        onChange={(e) =>
                          handleTimeSelectChange("startTime", "minutes", e.target.value)
                        }
                        className={`flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${errors.startTime ? "border-red-500" : "border-gray-300"
                          }`}
                      >
                        {getMinutesArray().map((min) => (
                          <option key={min} value={min}>
                            {min}
                          </option>
                        ))}
                      </select>

                      {/* ✅ AM/PM Dropdown for Start Time */}
                      <select
                        value={startTimeParts.period}
                        onChange={(e) =>
                          handleTimeSelectChange("startTime", "period", e.target.value)
                        }
                        className={`flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${errors.startTime ? "border-red-500" : "border-gray-300"
                          }`}
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                    {errors.startTime && (
                      <p className="text-red-600 text-sm mt-1">{errors.startTime}</p>
                    )}
                  </div>



                  {/* End Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      End Time *
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={endTimeParts.hours}
                        onChange={(e) =>
                          handleTimeSelectChange("endTime", "hours", e.target.value)
                        }
                        className={`flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${errors.endTime ? "border-red-500" : "border-gray-300"
                          }`}
                      >
                        {getHoursArray(false).map((hour) => (
                          <option key={hour} value={hour}>
                            {hour}
                          </option>
                        ))}
                      </select>


                      <select
                        value={endTimeParts.minutes}
                        onChange={(e) =>
                          handleTimeSelectChange("endTime", "minutes", e.target.value)
                        }
                        className={`flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${errors.endTime ? "border-red-500" : "border-gray-300"
                          }`}
                      >
                        {getMinutesArray().map((min) => (
                          <option key={min} value={min}>
                            {min}
                          </option>
                        ))}
                      </select>

                      {/* ✅ AM/PM Dropdown for End Time */}
                      <select
                        value={endTimeParts.period}
                        onChange={(e) =>
                          handleTimeSelectChange("endTime", "period", e.target.value)
                        }
                        className={`flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${errors.endTime ? "border-red-500" : "border-gray-300"
                          }`}
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                    {errors.endTime && (
                      <p className="text-red-600 text-sm mt-1">{errors.endTime}</p>
                    )}
                  </div>


                </div>


                {/* Duration Display */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Shift Timing:</span> {formatTo12Hour(formData.startTime)} to{" "}
                    {formatTo12Hour(formData.endTime)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Duration: <span className="font-bold text-blue-600">{durationHours} hours</span>
                  </p>
                </div>
              </div>


              {/* Validity Section - COMMENTED OUT */}
              {/* <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Validity Period</h3>


                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Effective From
                    </label>
                    <input
                      type="date"
                      name="effectiveFrom"
                      value={formData.effectiveFrom}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Effective Until
                    </label>
                    <input
                      type="date"
                      name="effectiveUntil"
                      value={formData.effectiveUntil}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${errors.effectiveUntil ? "border-red-500" : "border-gray-300"
                        }`}
                    />
                    {errors.effectiveUntil && (
                      <p className="text-red-600 text-sm mt-1">{errors.effectiveUntil}</p>
                    )}
                  </div>
                </div>
              </div> */}


              {/* Submit Buttons */}
              <div className="border-t border-gray-200 pt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="cursor-pointer px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="cursor-pointer px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Creating...</span>
                    </>
                  ) : (
                    "Create Shift"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
