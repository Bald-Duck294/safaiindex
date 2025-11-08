import { Spinner } from "@/components/ui/Spinner";
import React from "react";

export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
