"use client";

import { Suspense } from 'react';
import ReviewContent from './ReviewContent';
// import useCompanyId from '@/lib/utils/getCompanyId';
import { useCompanyId } from '@/lib/providers/CompanyProvider';


// A simple loading UI to show while the main component loads.
const Loading = () => {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-slate-600">🌀 Loading Activity...</h2>
    </div>
  );
};

export default function CleanerReviewPage() {

  const { companyId } = useCompanyId();
  return (
    <Suspense fallback={<Loading />}>
      <ReviewContent companyId={companyId} />
    </Suspense>
  );
}