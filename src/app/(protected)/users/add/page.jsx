"use client";

import { UsersApi } from "@/lib/api/usersApi";
import { useRouter } from "next/navigation";
// import roleApi from "@/lib/api/roleApi";    
import toast, { Toaster } from "react-hot-toast";
// import UserForm from "@/app/components/users/UserForm";
import UserForm from "@/components/users/UserForm";
import { ArrowLeft } from "lucide-react";
import { useCompanyId } from "@/lib/providers/CompanyProvider";

export default function AddUserPage() {
  // Navigation handler using standard web APIs

  const router = useRouter();

  const {companyId} = useCompanyId();

  console.log(companyId, 'companyId from add usere');
  const handleAddUser = async (formData) => {
    const toastId = toast.loading("Creating user...");
    const response = await UsersApi.createUser(formData, companyId);

    if (response.success) {
      toast.success("User created successfully!", { id: toastId });
      router.push(`/users?companyId=${companyId}`); // ✅ use Next router
    } else {
      toast.error(response.error || "Failed to create user.", { id: toastId });
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="p-4 sm:p-6 md:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => window.history.back()} className="flex items-center gap-2 mb-6 text-sm font-semibold text-slate-600 hover:text-slate-800">
            <ArrowLeft size={18} />
            Back to Users
          </button>
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6">Add New User</h1>
            <UserForm onSubmit={handleAddUser} />
          </div>
        </div>
      </div>
    </>
  );
}

