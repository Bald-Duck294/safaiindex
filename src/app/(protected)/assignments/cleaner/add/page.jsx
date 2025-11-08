import { Suspense } from "react";
import AddAssignmentContent from "./AddAssignmentContent";
import Loader from "@/components/ui/Loader";
export default function AddAssignmentPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-50 to-gray-100">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Loading form...</p>
                </div>
            </div>
        }>
            <AddAssignmentContent />
        </Suspense>
    );
}
