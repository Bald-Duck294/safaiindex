// src/app/login/page.js
"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { loginStart, loginSuccess, loginFailure } from "../../../store/slices/authSlice";
import toast, { Toaster } from "react-hot-toast";
import { FaRestroom } from "react-icons/fa";
// import { AuthApi } from "../../../lib/api/authApi.js" // Assuming you have this API utility
// import { AuthApi } from "@/lib/api/authApi";
import { AuthApi } from "@/lib/api/authApi";
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  // Using a local state for the UI loading indicator
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();

  const handleInputChange = (e) => {
    let { name, value } = e.target;

    // Restrict phone input to 10 numeric digits
    if (name === "phone") {
      value = value.replace(/[^0-9]/g, '').slice(0, 10);
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start local loading indicator

    if (isLogin) {
      // --- LOGIN LOGIC ---

      console.log('here')
      dispatch(loginStart()); // Still dispatch to manage global state
      try {
        const response = await AuthApi.login(formData.phone, formData.password);

        if (response.success && response.data?.status === "success") {
          toast.success("Login Successful!");
          dispatch(loginSuccess(response.data.user));

          console.log(response.data.user, "user data");

          if (response.data.user?.role_id === 1) {
            // Superadmin → Main dashboard
            router.push('/dashboard');
          } else if (response.data.user?.role_id === 2 && response.data.user?.company_id) {
            // Admin → Their company dashboard
            router.push(`/clientDashboard/${response.data.user?.company_id}`);
          }
          else if (response.data.user?.role_id === 3 && response.data.user?.company_id) {
            // Admin → Their company dashboard
            router.push(`/clientDashboard/${response.data.user?.company_id}`);
          }
          // router.push("/dashboard");
          // router.push('/dashboard');
        } else {
          toast.error(response.error || "Login failed. Please check your credentials.");
          dispatch(loginFailure());
        }
      } catch (error) {
        toast.error(error.message || "An unexpected error occurred.");
        dispatch(loginFailure());
      }
    } else {
      // --- SIGNUP LOGIC ---
      try {
        const response = await AuthApi.register(formData);

        if (response.success && response.data?.message === "User registered") {
          toast.success("Registration successful! Please sign in.");
          setIsLogin(true);
          setFormData({ name: "", email: "", phone: "", password: "" });
        } else {
          toast.error(response.error || "Registration failed. Please try again.");
        }
      } catch (error) {
        toast.error(error.message || "An unexpected error occurred during registration.");
      }
    }
    setIsLoading(false); // Stop local loading indicator in all cases
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl">
          <div className="text-center">
            <FaRestroom className="mx-auto text-5xl text-red-600" />
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
              FMT Portal
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {isLogin
                ? "Welcome Back! Please login to your account."
                : "Create a new account."}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Fields for Signup */}
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="name" className="text-sm font-medium text-slate-700">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required={!isLogin}
                    maxLength="100"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 mt-2 text-slate-800 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required={!isLogin}
                    maxLength="200"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 mt-2 text-slate-800 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                  />
                </div>
              </>
            )}

            {/* Phone Number field */}
            <div>
              <label htmlFor="phone" className="text-sm font-medium text-slate-700">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 mt-2 text-slate-800 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-2 mt-2 text-slate-800 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className=" cursor-pointer w-full px-4  py-3 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-transform transform hover:scale-105 disabled:bg-red-400 disabled:cursor-not-allowed"
              >
                {isLoading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
              </button>
            </div>
          </form>
          <div className="text-center text-sm text-slate-500">
            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-semibold text-red-600 hover:underline ml-1"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthPage;
