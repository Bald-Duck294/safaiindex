"use client";
import { useEffect, useState } from "react";
import CreateForm from "../CreateForm";
import TreeView from "../TreeView";
import locationTypesApi from "@/lib/api/locationTypesApi";
// import useCompanyId from "@/lib/utils/getCompanyId";
import { useCompanyId } from '@/lib/providers/CompanyProvider';

export default function AddLocationTypesPage() {
  const [types, setTypes] = useState([]);
  const { companyId } = useCompanyId();
  const fetchTypes = async () => {
    const data = await locationTypesApi.getAll(companyId);
    setTypes(data);
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Create New Location Type</h2>
      <CreateForm onCreated={fetchTypes} allTypes={types} />
      <hr className="my-4" />
      <h3 className="text-lg font-semibold mb-2">Current Hierarchy (View Only)</h3>
      <TreeView types={types} onUpdate={fetchTypes} flag={true} />
    </div>
  );
}
