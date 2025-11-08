"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RegisteredUsersApi } from '@/lib/api/registeredUsersApi';
import toast, { Toaster } from 'react-hot-toast';

export default function RegisterPage() {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await RegisteredUsersApi.verifyPhone(phone);
      if (response.success) {
        // Store verification token and user info
        localStorage.setItem('verification_token', response.data.verification_token);
        localStorage.setItem('user_info', JSON.stringify(response.data));

        toast.success('Phone verified! Please set your password.');
        router.push('/register/set-password');
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error('Error verifying phone number');
    }
    setIsLoading(false);
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Register Your Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your registered phone number to continue
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                >
                  {isLoading ? 'Verifying...' : 'Verify Phone Number'}
                </button>
              </div>

              <div className="text-center">
                <Link
                  href="/login"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Already have an account? Sign in
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
