// "use client";

// import { useState, useEffect } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import {
//   User,
//   Mail,
//   Phone,
//   MessageSquare,
//   CheckSquare,
//   Send,
//   CheckCircle,
//   Languages,
// } from "lucide-react";
// import SmileyRating from "./SmileyRating";
// import LocationDetector from "../cleaner-review/LocationDetector";
// import ImageUploader from "../cleaner-review/ImageUploader";

// const reviewSchema = z.object({
//   name: z.string().min(1, "Name is required"),
//   email: z.string().email("A valid email is required"),
//   phone: z
//     .string()
//     .min(10, "A valid 10-digit phone number is required")
//     .max(10, "Phone number should be 10 digits"),
//   rating: z.number().min(1, "Rating is required").max(10),
//   reason_ids: z.array(z.number()),
//   description: z.string().optional(),
//   images: z.array(z.instanceof(File)).optional(),
//   location: z
//     .object({
//       latitude: z.number(),
//       longitude: z.number(),
//       address: z.string().optional(),
//     })
//     .nullable(),
// });

// const commonIndianWashroomIssues = [
//   { id: 1, text: "Dirty or unflushed toilets (Western or Indian)" },
//   { id: 2, text: "Wet, slippery, or muddy floors" },
//   { id: 3, text: "Unpleasant or strong odor" },
//   { id: 4, text: "Paan / Gutka spit stains" },
//   { id: 5, text: "Overflowing dustbins" },
//   { id: 6, text: "General grime (stained walls, dirty mirrors)" },
//   { id: 7, text: "No water in taps or for flush" },
//   { id: 8, text: "Leaking taps, pipes, or cisterns" },
//   { id: 9, text: "Broken or missing health faucet (jet spray)" },
//   { id: 10, text: "No mug or lota available" },
//   { id: 11, text: "Broken or missing toilet seat" },
//   { id: 12, text: "Faulty or broken door lock/latch" },
//   { id: 13, text: "Low water pressure" },
//   { id: 14, text: "No hand-washing soap" },
//   { id: 15, text: "No toilet paper available" },
//   { id: 16, text: "Faulty hand dryer or no paper towels" },
//   { id: 17, text: "Poor or no lighting" },
//   { id: 18, text: "No hooks for bags or clothes" },
//   { id: 19, text: "Poor ventilation (no fan or window)" },
// ];

// // const translations = {
// //   en: {
// //     title: "Public Washroom Review",
// //     subtitle: "Help others by sharing your washroom experience.",
// //     ratingLabel: "Overall Rating *",
// //   },
// //   hi: {
// //     title: "सार्वजनिक शौचालय समीक्षा",
// //     subtitle: "अपना अनुभव साझा करके दूसरों की मदद करें।",
// //     ratingLabel: "कुल रेटिंग *",
// //   },
// //   mr: {
// //     title: "सार्वजनिक शौचालय पुनरावलोकन",
// //     subtitle: "तुमचा अनुभव शेअर करून इतरांना मदत करा.",
// //     ratingLabel: "एकूण रेटिंग *",
// //   },
// // };

// const translations = {
//   en: {
//     title: "Public Washroom Review",
//     subtitle: "Help others by sharing your washroom experience.",
//     ratingLabel: "Overall Rating *",
//     fields: {
//       name: "Name *",
//       email: "Email *",
//       phone: "Phone *",
//       additional: "Additional Comments (Optional)",
//       selectIssues: "Select Observed Issues (Optional):",
//     },
//     issues: [
//       "Dirty or unflushed toilets (Western or Indian)",
//       "Wet, slippery, or muddy floors",
//       "Unpleasant or strong odor",
//       "Paan / Gutka spit stains",
//       "Overflowing dustbins",
//       "General grime (stained walls, dirty mirrors)",
//       "No water in taps or for flush",
//       "Leaking taps, pipes, or cisterns",
//       "Broken or missing health faucet (jet spray)",
//       "No mug or lota available",
//       "Broken or missing toilet seat",
//       "Faulty or broken door lock/latch",
//       "Low water pressure",
//       "No hand-washing soap",
//       "No toilet paper available",
//       "Faulty hand dryer or no paper towels",
//       "Poor or no lighting",
//       "No hooks for bags or clothes",
//       "Poor ventilation (no fan or window)",
//     ],
//   },
//   hi: {
//     title: "सार्वजनिक शौचालय समीक्षा",
//     subtitle: "अपना अनुभव साझा करके दूसरों की मदद करें।",
//     ratingLabel: "कुल रेटिंग *",
//     fields: {
//       name: "नाम *",
//       email: "ईमेल *",
//       phone: "फ़ोन नंबर *",
//       additional: "अतिरिक्त टिप्पणियाँ (वैकल्पिक)",
//       selectIssues: "देखी गई समस्याएँ चुनें (वैकल्पिक):",
//     },
//     issues: [
//       "गंदे या बिना फ्लश किए शौचालय (पश्चिमी या भारतीय)",
//       "गीले, फिसलन भरे या कीचड़युक्त फर्श",
//       "अप्रिय या तेज़ गंध",
//       "पान / गुटखा के दाग",
//       "ओवरफ्लो होते कूड़ेदान",
//       "सामान्य गंदगी (दीवारों, शीशों पर धब्बे)",
//       "नल या फ्लश में पानी नहीं",
//       "लीक होते नल, पाइप या फ्लश",
//       "टूटा या गायब जेट स्प्रे",
//       "मग या लोटा नहीं है",
//       "टूटी या गायब टॉयलेट सीट",
//       "दरवाज़े का लॉक/लैच टूटा हुआ",
//       "कम पानी का दबाव",
//       "हाथ धोने का साबुन नहीं है",
//       "टॉयलेट पेपर नहीं है",
//       "खराब हैंड ड्रायर या टिशू नहीं",
//       "कमज़ोर या अनुपस्थित प्रकाश व्यवस्था",
//       "बैग या कपड़े के लिए हुक नहीं",
//       "खराब वेंटिलेशन (पंखा या खिड़की नहीं)",
//     ],
//   },
//   mr: {
//     title: "सार्वजनिक शौचालय पुनरावलोकन",
//     subtitle: "तुमचा अनुभव शेअर करून इतरांना मदत करा.",
//     ratingLabel: "एकूण रेटिंग *",
//     fields: {
//       name: "नाव *",
//       email: "ईमेल *",
//       phone: "फोन नंबर *",
//       additional: "अतिरिक्त टिप्पण्या (ऐच्छिक)",
//       selectIssues: "नोट केलेल्या समस्या निवडा (ऐच्छिक):",
//     },
//     issues: [
//       "घाणेरडे किंवा फ्लश न केलेले शौचालय (पाश्चिमात्य किंवा भारतीय)",
//       "ओले, घसरणारे किंवा चिखलयुक्त मजले",
//       "दुर्गंधीयुक्त किंवा तीव्र वास",
//       "पान / गुटखा चे डाग",
//       "भरलेले कचरा डबे",
//       "सामान्य घाण (भिंतींवर डाग, घाणेरडी आरसे)",
//       "नळ किंवा फ्लश साठी पाणी नाही",
//       "गळती करणारे नळ, पाइप किंवा फ्लश",
//       "तुटलेला किंवा हरवलेला जेट स्प्रे",
//       "मग किंवा लोटा उपलब्ध नाही",
//       "तुटलेली किंवा गायब टॉयलेट सीट",
//       "दरवाज्याचा लॉक/कडी खराब आहे",
//       "कमी पाण्याचा दाब",
//       "हात धुण्यासाठी साबण नाही",
//       "टॉयलेट पेपर नाही",
//       "खराब हात ड्रायर किंवा टिश्यू पेपर नाहीत",
//       "खराब किंवा अनुपस्थित प्रकाश",
//       "पिशवी किंवा कपड्यांसाठी हुक नाहीत",
//       "खराब वायुवीजन (पंखा किंवा खिडकी नाही)",
//     ],
//   },
// };

// export default function ReviewForm() {
//   const [images, setImages] = useState([]);
//   const [location, setLocation] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [lang, setLang] = useState("en");

//   useEffect(() => {
//     // Future: fetch toilet lang_preference by toilet ID here
//     // Default fallback to English
//     setLang("en");
//   }, []);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isValid },
//     setValue,
//     watch,
//     reset,
//   } = useForm({
//     resolver: zodResolver(reviewSchema),
//     mode: "onChange",
//     defaultValues: {
//       rating: 0,
//       reason_ids: [],
//       description: "",
//       images: [],
//       location: null,
//     },
//   });

//   const rating = watch("rating");
//   const selectedReasons = watch("reason_ids");

//   const handleImagesChange = (newImages) => {
//     setImages(newImages);
//     setValue("images", newImages, { shouldValidate: true });
//   };

//   const handleLocationChange = (newLocation) => {
//     setLocation(newLocation);
//     setValue("location", newLocation, { shouldValidate: true });
//   };

//   const handleRatingChange = (newRating) => {
//     setValue("rating", newRating, { shouldValidate: true });
//   };

//   const handleReasonToggle = (reasonId) => {
//     const updated = selectedReasons.includes(reasonId)
//       ? selectedReasons.filter((id) => id !== reasonId)
//       : [...selectedReasons, reasonId];
//     setValue("reason_ids", updated);
//   };

//   const handleSubmission = async (e) => {
//     e.preventDefault();

//     const data = watch();

//     if (!data.name || !data.phone || !data.rating || !location) {
//       alert("Please fill all required fields and set a location.");
//       return;
//     }

//     try {
//       setIsSubmitting(true);

//       const formData = new FormData();
//       formData.append("name", data.name);
//       formData.append("email", data.email);
//       formData.append("phone", data.phone);
//       formData.append("rating", data.rating.toString());
//       formData.append("description", data.description || "");
//       formData.append("reason_ids", JSON.stringify(data.reason_ids));
//       formData.append("latitude", location.latitude.toString());
//       formData.append("longitude", location.longitude.toString());
//       formData.append("address", location.address || "");
//       formData.append("toilet_id", "1");

//       images.forEach((img) => {
//         formData.append("images", img);
//       });

//       const res = await fetch("http://localhost:8000/api/reviews/user-review", {
//         method: "POST",
//         body: formData,
//       });

//       if (!res.ok) throw new Error("Failed to submit review");

//       setTimeout(() => setShowSuccess(false), 5000);
//     } catch (err) {
//       console.error(err);
//       alert("Something went wrong. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (showSuccess) {
//     return (
//       <div className="max-w-2xl mx-auto p-6">
//         <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
//           <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
//           <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h2>
//           <p className="text-gray-600 mb-8 text-lg">
//             Your washroom review has been submitted successfully. Thank you for
//             helping improve public facilities!
//           </p>
//           <button
//             onClick={() => setShowSuccess(false)}
//             className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
//           >
//             Submit Another Review
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-3xl mx-auto p-4 sm:p-6">
//       <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//         <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
//           <div className="flex justify-between items-start">
//             <div>
//               <h1 className="text-3xl font-bold mb-3">
//                 {translations[lang].title}
//               </h1>
//               <p className="text-blue-100 text-lg">
//                 {translations[lang].subtitle}
//               </p>
//             </div>
//             <select
//               value={lang}
//               onChange={(e) => setLang(e.target.value)}
//               className="text-blue-700 bg-white border border-white rounded-full px-3 py-1 text-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white"
//             >
//               <option value="en">EN</option>
//               <option value="hi">HI</option>
//               <option value="mr">MR</option>
//             </select>
//           </div>
//         </div>
//         <form onSubmit={handleSubmission} className="p-6 sm:p-8 space-y-8">
//           <LocationDetector
//             location={location}
//             onLocationChange={handleLocationChange}
//           />
//           {errors.location && (
//             <p className="text-red-500 text-xs mt-1">
//               Location is a required field.
//             </p>
//           )}

//           <div className="grid md:grid-cols-3 gap-6">
//             <div>
//               <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
//                 <User className="h-4 w-4 mr-1" /> {translations[lang].title}
//               </label>
//               <input
//                 {...register("name")}
//                 type="text"
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                 placeholder="Your full name"
//               />
//               {errors.name && (
//                 <p className="text-red-500 text-xs mt-1">
//                   {errors.name.message}
//                 </p>
//               )}
//             </div>

//             <div>
//               <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
//                 <Mail className="h-4 w-4 mr-1" /> Email *
//               </label>
//               <input
//                 {...register("email")}
//                 type="email"
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                 placeholder="your.email@example.com"
//               />
//               {errors.email && (
//                 <p className="text-red-500 text-xs mt-1">
//                   {errors.email.message}
//                 </p>
//               )}
//             </div>

//             <div>
//               <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
//                 <Phone className="h-4 w-4 mr-1" /> Phone *
//               </label>
//               <input
//                 {...register("phone")}
//                 type="tel"
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                 placeholder="10-digit mobile number"
//               />
//               {errors.phone && (
//                 <p className="text-red-500 text-xs mt-1">
//                   {errors.phone.message}
//                 </p>
//               )}
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-4">
//               {translations[lang].ratingLabel}
//             </label>
//             <SmileyRating
//               rating={rating}
//               onRatingChange={handleRatingChange}
//               size={32}
//             />
//             {errors.rating && (
//               <p className="text-red-500 text-xs mt-2">
//                 {errors.rating.message}
//               </p>
//             )}
//           </div>

//           <ImageUploader images={images} onImagesChange={handleImagesChange} />
//           {errors.images && (
//             <p className="text-red-500 text-xs mt-1">{errors.images.message}</p>
//           )}

//           <div>
//             <label className="flex items-center text-sm font-medium text-gray-700 mb-4">
//               <CheckSquare className="h-4 w-4 mr-1" />
//               Select Observed Issues (Optional):
//             </label>
//             <div className="grid sm:grid-cols-2 gap-3">
//               {commonIndianWashroomIssues.map((reason) => (
//                 <label
//                   key={reason.id}
//                   className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-gray-50 cursor-pointer"
//                 >
//                   <input
//                     type="checkbox"
//                     checked={selectedReasons.includes(reason.id)}
//                     onChange={() => handleReasonToggle(reason.id)}
//                     className="mt-0.5 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
//                   />
//                   <span className="text-sm text-gray-700">{reason.text}</span>
//                 </label>
//               ))}
//             </div>
//           </div>

//           <div>
//             <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
//               <MessageSquare className="h-4 w-4 mr-1" /> Additional Comments
//               (Optional)
//             </label>
//             <textarea
//               {...register("description")}
//               rows={4}
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
//               placeholder="Share more details about your experience..."
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={isSubmitting || !isValid}
//             className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-lg"
//           >
//             {isSubmitting ? (
//               <>
//                 <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
//                 <span>Submitting Review...</span>
//               </>
//             ) : (
//               <>
//                 <Send className="h-6 w-6" />
//                 <span>Submit Review</span>
//               </>
//             )}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Mail,
  Phone,
  MessageSquare,
  CheckSquare,
  Send,
  CheckCircle,
  Languages,
} from "lucide-react";
import SmileyRating from "./SmileyRating";
import LocationDetector from "../cleaner-review/LocationDetector";
import ImageUploader from "../cleaner-review/ImageUploader";

const reviewSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("A valid email is required"),
  phone: z
    .string()
    .min(10, "A valid 10-digit phone number is required")
    .max(10, "Phone number should be 10 digits"),
  rating: z.number().min(1, "Rating is required").max(10),
  reason_ids: z.array(z.number()),
  description: z.string().optional(),
  images: z.array(z.instanceof(File)).optional(),
  location: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
      address: z.string().optional(),
    })
    .nullable(),
});

const commonIndianWashroomIssues = [
  { id: 1, text: "Dirty or unflushed toilets (Western or Indian)" },
  { id: 2, text: "Wet, slippery, or muddy floors" },
  { id: 3, text: "Unpleasant or strong odor" },
  { id: 4, text: "Paan / Gutka spit stains" },
  { id: 5, text: "Overflowing dustbins" },
  { id: 6, text: "General grime (stained walls, dirty mirrors)" },
  { id: 7, text: "No water in taps or for flush" },
  { id: 8, text: "Leaking taps, pipes, or cisterns" },
  { id: 9, text: "Broken or missing health faucet (jet spray)" },
  { id: 10, text: "No mug or lota available" },
  { id: 11, text: "Broken or missing toilet seat" },
  { id: 12, text: "Faulty or broken door lock/latch" },
  { id: 13, text: "Low water pressure" },
  { id: 14, text: "No hand-washing soap" },
  { id: 15, text: "No toilet paper available" },
  { id: 16, text: "Faulty hand dryer or no paper towels" },
  { id: 17, text: "Poor or no lighting" },
  { id: 18, text: "No hooks for bags or clothes" },
  { id: 19, text: "Poor ventilation (no fan or window)" },
];

const translations = {
  en: {
    title: "Public Washroom Review",
    subtitle: "Help others by sharing your washroom experience.",
    ratingLabel: "Overall Rating *",
    fields: {
      name: "Name *",
      email: "Email *",
      phone: "Phone *",
      additional: "Additional Comments (Optional)",
      selectIssues: "Select Observed Issues (Optional):",
    },
    placeholders: {
      name: "Your full name",
      email: "your.email@example.com",
      phone: "10-digit mobile number",
      description: "Share more details about your experience...",
    },
    buttons: {
      submit: "Submit Review",
      submitting: "Submitting Review...",
      submitAnother: "Submit Another Review",
    },
    messages: {
      thankYou: "Thank You!",
      successMessage:
        "Your washroom review has been submitted successfully. Thank you for helping improve public facilities!",
      fillRequired: "Please fill all required fields and set a location.",
      submitError: "Something went wrong. Please try again.",
      locationRequired: "Location is a required field.",
    },
    issues: [
      "Dirty or unflushed toilets (Western or Indian)",
      "Wet, slippery, or muddy floors",
      "Unpleasant or strong odor",
      "Paan / Gutka spit stains",
      "Overflowing dustbins",
      "General grime (stained walls, dirty mirrors)",
      "No water in taps or for flush",
      "Leaking taps, pipes, or cisterns",
      // "Broken or missing health faucet (jet spray)",
      // "No mug or lota available",
      // "Broken or missing toilet seat",
      // "Faulty or broken door lock/latch",
      // "Low water pressure",
      // "No hand-washing soap",
      // "No toilet paper available",
      // "Faulty hand dryer or no paper towels",
      // "Poor or no lighting",
      // "No hooks for bags or clothes",
      // "Poor ventilation (no fan or window)",
    ],
  },
  hi: {
    title: "सार्वजनिक शौचालय समीक्षा",
    subtitle: "अपना अनुभव साझा करके दूसरों की मदद करें।",
    ratingLabel: "कुल रेटिंग *",
    fields: {
      name: "नाम *",
      email: "ईमेल *",
      phone: "फ़ोन नंबर *",
      additional: "अतिरिक्त टिप्पणियाँ (वैकल्पिक)",
      selectIssues: "देखी गई समस्याएँ चुनें (वैकल्पिक):",
    },
    placeholders: {
      name: "आपका पूरा नाम",
      email: "आपका.ईमेल@उदाहरण.com",
      phone: "10 अंकों का मोबाइल नंबर",
      description: "अपने अनुभव के बारे में और बताएं...",
    },
    buttons: {
      submit: "समीक्षा जमा करें",
      submitting: "समीक्षा जमा की जा रही है...",
      submitAnother: "दूसरी समीक्षा जमा करें",
    },
    messages: {
      thankYou: "धन्यवाद!",
      successMessage:
        "आपकी शौचालय समीक्षा सफलतापूर्वक जमा हो गई है। सार्वजनिक सुविधाओं को बेहतर बनाने में मदद करने के लिए धन्यवाद!",
      fillRequired: "कृपया सभी आवश्यक फ़ील्ड भरें और स्थान सेट करें।",
      submitError: "कुछ गलत हुआ। कृपया फिर से कोशिश करें।",
      locationRequired: "स्थान एक आवश्यक फ़ील्ड है।",
    },
    issues: [
      // "गंदे या बिना फ्लश किए शौचालय (पश्चिमी या भारतीय)",
      // "गीले, फिसलन भरे या कीचड़युक्त फर्श",
      // "अप्रिय या तेज़ गंध",
      // "पान / गुटखा के दाग",
      // "ओवरफ्लो होते कूड़ेदान",
      // "सामान्य गंदगी (दीवारों, शीशों पर धब्बे)",
      // "नल या फ्लश में पानी नहीं",
      // "लीक होते नल, पाइप या फ्लश",
      "टूटा या गायब जेट स्प्रे",
      "मग या लोटा नहीं है",
      "टूटी या गायब टॉयलेट सीट",
      "दरवाज़े का लॉक/लैच टूटा हुआ",
      "कम पानी का दबाव",
      "हाथ धोने का साबुन नहीं है",
      "टॉयलेट पेपर नहीं है",
      "खराब हैंड ड्रायर या टिशू नहीं",
      "कमज़ोर या अनुपस्थित प्रकाश व्यवस्था",
      "बैग या कपड़े के लिए हुक नहीं",
      "खराब वेंटिलेशन (पंखा या खिड़की नहीं)",
    ],
  },
  mr: {
    title: "सार्वजनिक शौचालय पुनरावलोकन",
    subtitle: "तुमचा अनुभव शेअर करून इतरांना मदत करा.",
    ratingLabel: "एकूण रेटिंग *",
    fields: {
      name: "नाव *",
      email: "ईमेल *",
      phone: "फोन नंबर *",
      additional: "अतिरिक्त टिप्पण्या (ऐच्छिक)",
      selectIssues: "नोट केलेल्या समस्या निवडा (ऐच्छिक):",
    },
    placeholders: {
      name: "तुमचे पूर्ण नाव",
      email: "तुमचा.ईमेल@उदाहरण.com",
      phone: "10 अंकांचा मोबाइल नंबर",
      description: "तुमच्या अनुभवाबद्दल अधिक सांगा...",
    },
    buttons: {
      submit: "पुनरावलोकन सबमिट करा",
      submitting: "पुनरावलोकन सबमिट होत आहे...",
      submitAnother: "दुसरे पुनरावलोकन सबमिट करा",
    },
    messages: {
      thankYou: "धन्यवाद!",
      successMessage:
        "तुमचे शौचालय पुनरावलोकन यशस्वीरित्या सबमिट झाले आहे. सार्वजनिक सुविधा सुधारण्यासाठी मदत केल्याबद्दल धन्यवाद!",
      fillRequired: "कृपया सर्व आवश्यक फील्ड भरा आणि स्थान सेट करा.",
      submitError: "काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.",
      locationRequired: "स्थान हे एक आवश्यक फील्ड आहे.",
    },
    issues: [
      // "घाणेरडे किंवा फ्लश न केलेले शौचालय (पाश्चिमात्य किंवा भारतीय)",
      // "ओले, घसरणारे किंवा चिखलयुक्त मजले",
      // "दुर्गंधीयुक्त किंवा तीव्र वास",
      // "पान / गुटखा चे डाग",
      // "भरलेले कचरा डबे",
      // "सामान्य घाण (भिंतींवर डाग, घाणेरडी आरसे)",
      // "नळ किंवा फ्लश साठी पाणी नाही",
      // "गळती करणारे नळ, पाइप किंवा फ्लश",
      "तुटलेला किंवा हरवलेला जेट स्प्रे",
      "मग किंवा लोटा उपलब्ध नाही",
      "तुटलेली किंवा गायब टॉयलेट सीट",
      "दरवाज्याचा लॉक/कडी खराब आहे",
      "कमी पाण्याचा दाब",
      "हात धुण्यासाठी साबण नाही",
      "टॉयलेट पेपर नाही",
      "खराब हात ड्रायर किंवा टिश्यू पेपर नाहीत",
      "खराब किंवा अनुपस्थित प्रकाश",
      "पिशवी किंवा कपड्यांसाठी हुक नाहीत",
      "खराब वायुवीजन (पंखा किंवा खिडकी नाही)",
    ],
  },
};

export default function ReviewForm() {
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lang, setLang] = useState("en");

  useEffect(() => {
    // Future: fetch toilet lang_preference by toilet ID here
    // Default fallback to English
    setLang("en");
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(reviewSchema),
    mode: "onChange",
    defaultValues: {
      rating: 0,
      reason_ids: [],
      description: "",
      images: [],
      location: null,
    },
  });

  const rating = watch("rating");
  const selectedReasons = watch("reason_ids");

  const handleImagesChange = (newImages) => {
    setImages(newImages);
    setValue("images", newImages, { shouldValidate: true });
  };

  const handleLocationChange = (newLocation) => {
    setLocation(newLocation);
    setValue("location", newLocation, { shouldValidate: true });
  };

  const handleRatingChange = (newRating) => {
    setValue("rating", newRating, { shouldValidate: true });
  };

  const handleReasonToggle = (reasonId) => {
    const updated = selectedReasons.includes(reasonId)
      ? selectedReasons.filter((id) => id !== reasonId)
      : [...selectedReasons, reasonId];
    setValue("reason_ids", updated);
  };

  // const handleSubmission = async (data) => {
  //   // e.preventDefault();

  //   // const data = watch();

  //   if (!data.name || !data.phone || !data.rating || !location) {
  //     alert(translations[lang].messages.fillRequired);
  //     return;
  //   }

  //   try {
  //     setIsSubmitting(true);

  //     const formData = new FormData();
  //     formData.append("name", data.name);
  //     formData.append("email", data.email);
  //     formData.append("phone", data.phone);
  //     formData.append("rating", data.rating.toString());
  //     formData.append("description", data.description || "");
  //     formData.append("reason_ids", JSON.stringify(data.reason_ids));
  //     formData.append("latitude", location.latitude.toString());
  //     formData.append("longitude", location.longitude.toString());
  //     formData.append("address", location.address || "");
  //     formData.append("toilet_id", "1");

  //     images.forEach((img) => {
  //       formData.append("images", img);
  //     });

  //     console.log(formData, data, "dubmitssion data");

  //     const res = await fetch("http://localhost:8000/api/reviews/user-review", {
  //       method: "POST",
  //       body: formData,
  //     });

  //     if (!res.ok) throw new Error("Failed to submit review");

  //     setShowSuccess(true);
  //     reset();
  //     setImages([]);
  //     setLocation(null);
  //     setTimeout(() => setShowSuccess(false), 5000);
  //   } catch (err) {
  //     console.error(err);
  //     alert(translations[lang].messages.submitError);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const handleSubmission = async (data) => {
  if (!data.name || !data.phone || !data.rating || !data.location) {
    alert(translations[lang].messages.fillRequired);
    return;
  }

  try {
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    formData.append("rating", data.rating.toString());
    formData.append("description", data.description || "");
    formData.append("reason_ids", JSON.stringify(data.reason_ids));
    formData.append("latitude", data.location.latitude.toString());
    formData.append("longitude", data.location.longitude.toString());
    formData.append("address", data.location.address || "");
    formData.append("toilet_id", "1");

    images.forEach((img) => {
      formData.append("images", img);
    });

    const res = await fetch("https://safai-index-backend.onrender.com/api/reviews/user-review", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Failed to submit review");

    setShowSuccess(true);
    reset();
    setImages([]);
    setLocation(null);
    setTimeout(() => setShowSuccess(false), 5000);
  } catch (err) {
    console.error(err);
    alert(err);
  } finally {
    setIsSubmitting(false);
  }
};

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {translations[lang].messages.thankYou}
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            {translations[lang].messages.successMessage}
          </p>
          <button
            onClick={() => setShowSuccess(false)}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {translations[lang].buttons.submitAnother}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-3">
                {translations[lang].title}
              </h1>
              <p className="text-blue-100 text-lg">
                {translations[lang].subtitle}
              </p>
            </div>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="text-blue-700 bg-white border border-white rounded-full px-3 py-1 text-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <option value="en">EN</option>
              <option value="hi">HI</option>
              <option value="mr">MR</option>
            </select>
          </div>
        </div>
        <form
          onSubmit={handleSubmit(handleSubmission)}
          className="p-6 sm:p-8 space-y-8"
        >
          <LocationDetector
            location={location}
            onLocationChange={handleLocationChange}
          />
          {errors.location && (
            <p className="text-red-500 text-xs mt-1">
              {translations[lang].messages.locationRequired}
            </p>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 mr-1" />{" "}
                {translations[lang].fields.name}
              </label>
              <input
                {...register("name")}
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                placeholder={translations[lang].placeholders.name}
              />

              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4 mr-1" />{" "}
                {translations[lang].fields.email}
              </label>
              <input
                {...register("email")}
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                placeholder={translations[lang].placeholders.email}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 mr-1" />{" "}
                {translations[lang].fields.phone}
              </label>
              <input
                {...register("phone")}
                type="tel"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                placeholder={translations[lang].placeholders.phone}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              {translations[lang].ratingLabel}
            </label>
            <SmileyRating
              rating={rating}
              onRatingChange={handleRatingChange}
              size={32}
            />
            {errors.rating && (
              <p className="text-red-500 text-xs mt-2">
                {errors.rating.message}
              </p>
            )}
          </div>

          <ImageUploader images={images} onImagesChange={handleImagesChange} />
          {errors.images && (
            <p className="text-red-500 text-xs mt-1">{errors.images.message}</p>
          )}

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-4">
              <CheckSquare className="h-4 w-4 mr-1" />
              {translations[lang].fields.selectIssues}
            </label>
            <div className="grid sm:grid-cols-2 gap-3">
              {translations[lang].issues.map((issueText, index) => (
                <label
                  key={commonIndianWashroomIssues[index].id}
                  className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedReasons.includes(
                      commonIndianWashroomIssues[index].id
                    )}
                    onChange={() =>
                      handleReasonToggle(commonIndianWashroomIssues[index].id)
                    }
                    className="mt-0.5 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{issueText}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="h-4 w-4 mr-1" />{" "}
              {translations[lang].fields.additional}
            </label>
            <textarea
              {...register("description")}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none text-black"
              placeholder={translations[lang].placeholders.description}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-lg"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>{translations[lang].buttons.submitting}</span>
              </>
            ) : (
              <>
                <Send className="h-6 w-6" />
                <span>{translations[lang].buttons.submit}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
