"use client";

import { useEffect, useState } from "react";
// import { getAllCleanerReviews } from "@/app/lib/cleanerReviewApi";
// import { getAllCleanerReviews } from "@/lib/api/cleanerReviewApi";
import { CleanerReviewApi } from "@/lib/api/cleanerReviewApi";

export default function CompletedTasks() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const data = await CleanerReviewApi.getAllCleanerReviews();
      setReviews(data);
    }
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Completed Tasks</h2>
      {reviews.map((review) => (
        <div key={review.id} className="border p-4 rounded-lg shadow mb-4">
          <div className="text-sm text-gray-600">
            🕒 {new Date(review.created_at).toLocaleString()}
          </div>
          <div className="mt-2 text-gray-800">
            <strong>Remarks:</strong> {review.remarks || "No remarks"}
          </div>

          {/* {review.images && review.images.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {review.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Image ${idx + 1}`}
                  className="w-full h-40 object-cover rounded"
                />
              ))}
            </div>
          )} */}
        </div>
      ))}
    </div>
  );
}
