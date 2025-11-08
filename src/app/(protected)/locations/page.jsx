"use client";

import dynamic from "next/dynamic";
import { useCompanyId } from '@/lib/providers/CompanyProvider';


const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
});

export default function LocationsPage() {


  // console.log(companyId, hasCompanyContext, "from location company id ")

  return (
    <div className="container mx-auto p-4">
      <MapView />
    </div>
  );
}
