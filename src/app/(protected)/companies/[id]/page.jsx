"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { Building, Mail, FileText, ArrowLeft } from "lucide-react";
import { CompanyApi } from "@/lib/api/companyApi";
// Skeleton for the form while loading data
const FormSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div>
      <div className="h-5 bg-slate-200 rounded w-1/4 mb-2"></div>
      <div className="h-10 bg-slate-200 rounded-lg w-full"></div>
    </div>
    <div>
      <div className="h-5 bg-slate-200 rounded w-1/4 mb-2"></div>
      <div className="h-20 bg-slate-200 rounded-lg w-full"></div>
    </div>
    <div>
      <div className="h-5 bg-slate-200 rounded w-1/4 mb-2"></div>
      <div className="h-10 bg-slate-200 rounded-lg w-full"></div>
    </div>
     <div className="pt-4 border-t border-slate-200">
        <div className="h-12 bg-slate-200 rounded-lg w-full"></div>
     </div>
  </div>
);


export default function EditCompanyPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    console.log('in use effect')
    if (!id) return;  

    const fetchCompanyData = async () => {
        console.log('fun called ')
      setIsFetching(true);
      const response = await CompanyApi.getCompanyById(id);
      console.log(response , "res");
      if (response.success) {
        const { name, description, contact_email } = response.data;
        setName(name);
        setDescription(description || "");
        setContactEmail(contact_email || "");
      } else {
        toast.error(response.error || "Could not fetch company data.");
        setTimeout(() => router.push("/companies"), 1500);
      }
      setIsFetching(false);
    };

    fetchCompanyData();
  }, [id, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      return toast.error("Company name is required.");
    }
    setIsLoading(true);
    
    const companyData = {
      name,
      description,
      contact_email: contactEmail,
    };

    const response = await CompanyApi.updateCompany(id, companyData);
    
    if (response.success) {
      toast.success("Company updated successfully!");
      setTimeout(() => {
        router.push("/companies");
      }, 1000);
    } else {
      toast.error(response.error || "Failed to update company.");
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="p-4 sm:p-6 md:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-200/60">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 mb-6">
            <ArrowLeft size={16} />
            Back to Companies
          </button>
          
          <div className="flex items-center gap-4 mb-8">
            <Building className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-slate-800">Edit Company</h1>
          </div>

          {isFetching ? <FormSkeleton/> : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">Company Name *</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter company name"
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
                    placeholder="e.g., contact@company.com"
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
                  {isLoading ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

