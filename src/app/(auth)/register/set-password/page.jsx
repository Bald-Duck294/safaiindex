// app/(auth)/register/set-password/page.tsx
import { Suspense } from 'react';
import SetPasswordContent from './SetPasswordContent.jsx'
export default function SetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SetPasswordContent />
    </Suspense>
  );
}
