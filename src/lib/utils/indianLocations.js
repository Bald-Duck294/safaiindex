export const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

// Indian pincode validation: 6 digits, doesn't start with 0
export const validatePincode = (pincode) => {
    const regex = /^[1-9][0-9]{5}$/;
    return regex.test(pincode);
};

// Add this near the top of your component with INDIAN_STATES
const MAJOR_INDIAN_CITIES = [
    // Maharashtra
    "Mumbai", "Pune", "Nagpur", "Nashik", "Thane", "Aurangabad",
    // Delhi
    "New Delhi", "Delhi",
    // Karnataka
    "Bangalore", "Mysore", "Mangalore", "Hubli",
    // Tamil Nadu
    "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem",
    // West Bengal
    "Kolkata", "Howrah", "Durgapur",
    // Gujarat
    "Ahmedabad", "Surat", "Vadodara", "Rajkot",
    // Rajasthan
    "Jaipur", "Jodhpur", "Udaipur", "Kota",
    // Uttar Pradesh
    "Lucknow", "Kanpur", "Agra", "Varanasi", "Allahabad", "Meerut", "Ghaziabad", "Noida",
    // Telangana
    "Hyderabad", "Warangal",
    // Andhra Pradesh
    "Visakhapatnam", "Vijayawada", "Guntur",
    // Kerala
    "Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur",
    // Madhya Pradesh
    "Bhopal", "Indore", "Jabalpur", "Gwalior",
    // Punjab
    "Chandigarh", "Ludhiana", "Amritsar", "Jalandhar",
    // Haryana
    "Faridabad", "Gurgaon", "Panipat",
    // Bihar
    "Patna", "Gaya", "Bhagalpur",
    // Odisha
    "Bhubaneswar", "Cuttack",
    // Assam
    "Guwahati", "Silchar",
    // Jharkhand
    "Ranchi", "Jamshedpur", "Dhanbad",
    // Chhattisgarh
    "Raipur", "Bhilai",
    // Uttarakhand
    "Dehradun", "Haridwar",
    // Goa
    "Panaji", "Margao",
].sort();

