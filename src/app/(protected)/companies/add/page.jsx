"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// import { CompanyApi } from "../../../lib/api/companyApi";
import { CompanyApi } from "@/lib/api/companyApi";
import toast, { Toaster } from "react-hot-toast";
import { Building, Mail, FileText, ArrowLeft } from "lucide-react";

export default function AddCompanyPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      return toast.error("Orgnization name is required.");
    }
    setIsLoading(true);

    const companyData = {
      name,
      description,
      contact_email: contactEmail,
    };

    const response = await CompanyApi.createCompany(companyData);

    if (response.success) {
      toast.success("Orgnizations created successfully!");
      setTimeout(() => {
        router.push("/companies");
      }, 1000);
    } else {
      toast.error(response.error || "Failed to create Orgnization.");
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="p-4 sm:p-6 md:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-200/60">
          <button onClick={() => router.back()} className="cursor-pointer flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 mb-6">
            <ArrowLeft size={16} />
            Back to Orgnizations
          </button>

          <div className="flex items-center gap-4 mb-8">
            <Building className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-slate-800">Add New Orgnization</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">Orgnization Name *</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter Orgnization name"
                  className="w-full pl-10 pr-4 py-2 text-md border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter a short description"
                  rows="3"
                  className="w-full pl-10 pr-4 py-2 text-md border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contactEmail" className="block text-sm font-semibold text-slate-700 mb-2">Contact Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="e.g., contact@Orgnization.com"
                  className="w-full pl-10 pr-4 py-2 text-md border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-3 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating..." : "Create Orgnization"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

