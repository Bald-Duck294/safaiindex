// src/app/login/page.js
"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { loginStart, loginSuccess, loginFailure } from "../../../store/slices/authSlice";
import toast, { Toaster } from "react-hot-toast";
import { FaRestroom } from "react-icons/fa";
import { AuthApi } from "@/lib/api/authApi";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
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
    setIsLoading(true);

    if (isLogin) {
      dispatch(loginStart());

      try {
        const response = await AuthApi.login(formData.phone, formData.password);
        console.log(response, "user login response");

        if (response.success && response.data?.status === "success") {
          const user = response.data.user;
          const token = user.token;

          if (!user?.role || !Array.isArray(user?.role?.permissions)) {
            toast.error("Invalid Login, Please Contact Support!");
            dispatch(loginFailure("Missing role/permissions"));
            return; // ✅ Early return, loading will stop in finally
          }

          if (token) {
            localStorage.setItem('token', token);
          }

          dispatch(loginSuccess(user));
          const roleId = parseInt(user?.role_id)
          toast.success(`Welcome back, ${user.name}!`);
          // console.log(user.role_id, "user before redirecting ");
          // console.log(user.role_id === 1, "user role id ");
          // console.log(typeof (roleId), "type of role id ");
          // console.log(typeof (user.role_id), "type of user role id ");
          // console.log(user.role_id === 1, "user role id ");


          if (roleId === 1) {
            // Superadmin → Main dashboard
            console.log('Redirecting to /dashboard for superadmin');
            router.push('/dashboard');
          } else if (user.company_id) {
            // All other roles with company_id → Client dashboard
            router.push(`/clientDashboard/${user.company_id}`);
          } else {
            // No company assigned (shouldn't happen for non-superadmin)
            toast.error("No company assigned. Contact support.");
            dispatch(logout());
          }

        } else {
          toast.error(response.error || "Login failed. Please check your credentials.");
          dispatch(loginFailure(response.error));
        }
      } catch (error) {
        console.error('Login error:', error);
        toast.error(error.message || "An unexpected error occurred.");
        dispatch(loginFailure(error.message));
      } finally {
        setIsLoading(false);
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
      } finally {
        setIsLoading(false);
      }
    }
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
            {/* Signup Fields */}
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="name" className="text-sm font-medium text-slate-700">
                    Full Name
                  </label>
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
                  <label htmlFor="email" className="text-sm font-medium text-slate-700">
                    Email
                  </label>
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

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="text-sm font-medium text-slate-700">
                Phone Number
              </label>
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

            {/* Password */}
            <div>
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </label>
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

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="cursor-pointer w-full px-4 py-3 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-transform transform hover:scale-105 disabled:bg-red-400 disabled:cursor-not-allowed"
              >
                {isLoading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
              </button>
            </div>
          </form>

          {/* Toggle Login/Signup */}
          <div className="text-center text-sm text-slate-500">
            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-semibold text-red-600 hover:underline ml-1"
                type="button"
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
