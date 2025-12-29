"use client";

import { UsersApi } from "@/lib/api/usersApi";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import UserForm from "@/components/users/UserForm";
import { ArrowLeft } from "lucide-react";
import { useCompanyId } from "@/lib/providers/CompanyProvider";

import { useRequirePermission } from '@/lib/hooks/useRequirePermission';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { MODULES } from '@/lib/constants/permissions';

export default function AddUserPage() {
  const router = useRouter();
  const { companyId } = useCompanyId();

  // ✅ Page protection
  useRequirePermission(MODULES.USERS);

  // ✅ Permission check
  const { canAdd } = usePermissions();
  const canAddUser = canAdd(MODULES.USERS);

  console.log(companyId, 'companyId from add user');
  
  const handleAddUser = async (formData) => {
    const toastId = toast.loading("Creating user...");
    const response = await UsersApi.createUser(formData, companyId);

    if (response.success) {
      toast.success("User created successfully!", { id: toastId });
      router.push(`/users?companyId=${companyId}`);
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
            
            {/* ✅ PASS canAddUser to form */}
            <UserForm 
              onSubmit={handleAddUser} 
              canSubmit={canAddUser} // ✅ Changed from canEdit to canSubmit
            />
          </div>
        </div>
      </div>
    </>
  );
}
