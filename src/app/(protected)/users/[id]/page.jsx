"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { UsersApi } from "@/lib/api/usersApi";
import toast, { Toaster } from "react-hot-toast";
import UserForm from "@/components/users/UserForm";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchUser = async () => {
        setIsLoading(true);
        const response = await UsersApi.getUserById(id);
        if (response.success) {
          setUser(response.data);
        } else {
          toast.error("Failed to fetch user data.");
          router.push("/users");
        }
        setIsLoading(false);
      };
      fetchUser();
    }
  }, [id, router]);

  const handleUpdateUser = async (formData) => {
    // Prevent sending an empty password string
    if (formData.password === '') {
      delete formData.password;
    }

    const toastId = toast.loading("Updating user...");
    const response = await UsersApi.updateUser(id, formData);

    if (response.success) {
      toast.success("User updated successfully!", { id: toastId });
      router.push("/users");
    } else {
      toast.error(response.error || "Failed to update user.", { id: toastId });
    }
  };

  return (
    <>
      <Toaster position="top-center" />
       <div className="p-4 sm:p-6 md:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-2xl mx-auto">
            <button onClick={() => router.back()} className="flex items-center gap-2 mb-6 text-sm font-semibold text-slate-600 hover:text-slate-800">
                <ArrowLeft size={18} />
                Back to Users
            </button>
           <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6">Edit User</h1>
                {isLoading ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    </div>
                ) : user ? (
                    <UserForm initialData={user} onSubmit={handleUpdateUser} isEditing={true} />
                ) : (
                    <p className="text-center text-slate-500">User not found.</p>
                )}
            </div>
        </div>
      </div>
    </>
  );
}
