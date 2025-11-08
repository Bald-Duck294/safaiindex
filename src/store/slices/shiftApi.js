import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "../../lib/axiosBaseQuery"; // ✅ Same path as reviewSlice

export const shiftApi = createApi({
  reducerPath: "shiftApi", // ✅ Must match store.js
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Shift"],
  endpoints: (builder) => ({
    getAllShifts: builder.query({
      query: ({ company_id, include_unavailable = false } = {}) => ({
        url: "/shifts",
        method: "GET",
        params: {
          company_id,
          include_unavailable,
        },
      }),
      transformResponse: (response) => ({
        shifts: response.data,
        count: response.count,
      }),
      providesTags: (result) =>
        result
          ? [
            ...result.shifts.map(({ id }) => ({
              type: "Shift",
              id,
            })),
            { type: "Shift", id: "LIST" },
          ]
          : [{ type: "Shift", id: "LIST" }],
    }),

    getShiftById: builder.query({
      query: ({ id, company_id, include_unavailable = false }) => ({
        url: `/shifts/${id}`,
        method: "GET",
        params: {
          company_id,
          include_unavailable,
        },
      }),
      transformResponse: (response) => response.data,
      providesTags: (result, error, { id }) => [{ type: "Shift", id }],
    }),

    createShift: builder.mutation({
      query: (shiftData) => ({
        url: "/shifts",
        method: "POST",
        data: shiftData,
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: [{ type: "Shift", id: "LIST" }],
    }),

    updateShift: builder.mutation({
      query: ({ id, ...shiftData }) => ({
        url: `/shifts/${id}`,
        method: "PUT",
        data: shiftData,
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: "Shift", id },
        { type: "Shift", id: "LIST" },
      ],
    }),

    deleteShift: builder.mutation({
      query: (id) => ({
        url: `/shifts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Shift", id },
        { type: "Shift", id: "LIST" },
      ],
    }),

    toggleShiftStatus: builder.mutation({
      query: (id) => ({
        url: `/shifts/${id}/toggle-status`,
        method: "PATCH",
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error, id) => [
        { type: "Shift", id },
        { type: "Shift", id: "LIST" },
      ],
    }),

  }),
});

// ✅ IMPORTANT: Export hooks exactly like reviewApi
export const {
  useGetAllShiftsQuery,
  useGetShiftByIdQuery,
  useCreateShiftMutation,
  useUpdateShiftMutation,
  useDeleteShiftMutation,
  useLazyGetAllShiftsQuery,
  useLazyGetShiftByIdQuery,
  useToggleShiftStatusMutation,
} = shiftApi;
