"use client";
import { useEffect, useState } from "react";
import CreateForm from "../CreateForm";
import TreeView from "../TreeView";
import locationTypesApi from "@/lib/api/locationTypesApi";
import { useCompanyId } from '@/lib/providers/CompanyProvider';
import toast, { Toaster } from "react-hot-toast"; // ✅ Add this import

export default function AddLocationTypesPage() {
  const [types, setTypes] = useState([]);
  const { companyId } = useCompanyId();
  
  const fetchTypes = async () => {
    const data = await locationTypesApi.getAll(companyId);
    setTypes(data);
  };

  useEffect(() => {
    if (!companyId || companyId === 'null' || companyId === null) {
      console.log('Skipping fetch - companyId not ready:', companyId);
      return;
    }
    fetchTypes();
  }, [companyId]);

  return (
    <>
      {/* ✅ Add Toaster component here */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
          loading: {
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#fff',
            },
          },
        }}
      />

      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Create New Location Hierarchy</h2>
        <CreateForm onCreated={fetchTypes} allTypes={types} />
        <hr className="my-4" />
        <h3 className="text-lg font-semibold mb-2">Current Hierarchy (View Only)</h3>
        <TreeView types={types} onUpdate={fetchTypes} flag={true} />
      </div>
    </>
  );
}
