import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "../../lib/axiosBaseQuery";

export const reviewApi = createApi({
  reducerPath: "reviewApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["UserReview"],
  endpoints: (builder) => ({
    // GET /api/reviews - Get all reviews with optional filters
    getUserReviews: builder.query({
      query: ({ toilet_id, company_id, status, date, limit = 50 } = {}) => ({
        url: "/reviews",
        method: "GET",
        params: {
          toilet_id,
          limit,
          company_id,  // Add company_id here
          status,      // Optional: add status filter
          date
        },
      }),
      transformResponse: (response) => ({
        reviews: response.data,
        count: response.count,
      }),
      providesTags: (result) =>
        result
          ? [
            ...result.reviews.map(({ id }) => ({
              type: "UserReview",
              id
            })),
            { type: "UserReview", id: "LIST" },
          ]
          : [{ type: "UserReview", id: "LIST" }],
    }),

    // GET /api/reviews/:id - Get single review by ID
    getUserReviewById: builder.query({
      query: (id) => ({
        url: `/reviews/${id}`,
        method: "GET",
      }),
      transformResponse: (response) => response.data,
      providesTags: (result, error, id) => [{ type: "UserReview", id }],
    }),

    // PUT /api/reviews/:id - Update review
    updateUserReview: builder.mutation({
      query: ({ id, ...reviewData }) => ({
        url: `/reviews/${id}`,
        method: "PUT",
        data: reviewData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "UserReview", id },
        { type: "UserReview", id: "LIST" },
      ],
    }),

    // DELETE /api/reviews/:id - Delete review
    deleteUserReview: builder.mutation({
      query: (id) => ({
        url: `/reviews/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "UserReview", id },
        { type: "UserReview", id: "LIST" },
      ],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetUserReviewsQuery,
  useGetUserReviewByIdQuery,
  useCreateUserReviewMutation,
  useUpdateUserReviewMutation,
  useDeleteUserReviewMutation,
  useLazyGetUserReviewsQuery,
  useLazyGetUserReviewByIdQuery,
} = reviewApi;
