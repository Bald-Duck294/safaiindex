// import { createApi } from "@reduxjs/toolkit/query/react";
// import axiosBaseQuery from "./axiosBaseQuery";

// export const configurationApi = createApi({
//   reducerPath: "configurationApi",
//   baseQuery: axiosBaseQuery({ baseUrl: "" }), // empty since axiosInstance already has baseURL
//   tagTypes: ["Configuration"],
//   endpoints: (builder) => ({
//     getToiletFeaturesByName: builder.query({
//       query: (name) => ({ 
//         url: `/configurations/${name}`, 
//         method: "get" 
//       }),
//       // ✅ Transform response to match your current format
//       transformResponse: (response) => {
//         // If response has status/data structure, extract the data
//         if (response && response.status === 'success' && response.data) {
//           return response.data;
//         }
//         return response;
//       },
//       providesTags: (result, error, name) => [
//         { type: "Configuration", id: name }
//       ],
//     }),
//     getToiletFeaturesById: builder.query({
//       query: (id) => ({ 
//         url: `/configurations/id/${id}`, 
//         method: "get" 
//       }),
//       transformResponse: (response) => {
//         if (response && response.status === 'success' && response.data) {
//           return response.data;
//         }
//         return response;
//       },
//       providesTags: (result, error, id) => [
//         { type: "Configuration", id }
//       ],
//     }),
//   }),
// });

// export const {
//   useGetToiletFeaturesByNameQuery,
//   useGetToiletFeaturesByIdQuery,
// } = configurationApi;


// store/slices/configurationApi.js
import { createApi } from "@reduxjs/toolkit/query/react";
// import axiosBaseQuery from "./axiosBaseQuery";
import axiosBaseQuery from "@/lib/axiosBaseQuery";

export const configurationApi = createApi({
  reducerPath: "configurationApi",
  baseQuery: axiosBaseQuery({ baseUrl: "" }),
  tagTypes: ["Configuration"],
  endpoints: (builder) => ({
    // ✅ GET ALL configurations
    getAllConfigurations: builder.query({
      query: (params = {}) => ({ 
        url: `/configurations`, 
        method: "get",
        params 
      }),
      transformResponse: (response) => {
        if (response?.status === 'success' && response.data) {
          return response.data;
        }
        return response;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Configuration", id })),
              { type: "Configuration", id: "LIST" },
            ]
          : [{ type: "Configuration", id: "LIST" }],
    }),

    // ✅ GET by name (your existing)
    getConfigurationByName: builder.query({
      query: ({ name, company_id }) => ({ 
        url: `/configurations/${name}${company_id ? `?company_id=${company_id}` : ''}`, 
        method: "get" 
      }),
      transformResponse: (response) => {
        if (response?.status === 'success' && response.data) {
          return response.data;
        }
        return response;
      },
      providesTags: (result, error, { name, company_id }) => [
        { type: "Configuration", id: `${name}-${company_id || 'global'}` }
      ],
    }),

    // ✅ GET by ID (your existing)
    getConfigurationById: builder.query({
      query: (id) => ({ 
        url: `/configurations/id/${id}`, 
        method: "get" 
      }),
      transformResponse: (response) => {
        if (response?.status === 'success' && response.data) {
          return response.data;
        }
        return response;
      },
      providesTags: (result, error, id) => [
        { type: "Configuration", id }
      ],
    }),

    // ✅ CREATE configuration
    createConfiguration: builder.mutation({
      query: (data) => ({ 
        url: `/configurations`, 
        method: "post", 
        data 
      }),
      transformResponse: (response) => {
        if (response?.status === 'success' && response.data) {
          return response.data;
        }
        return response;
      },
      invalidatesTags: [{ type: "Configuration", id: "LIST" }],
    }),

    // ✅ UPDATE configuration
    updateConfiguration: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/configurations/${id}`,
        method: "patch",
        data,
      }),
      transformResponse: (response) => {
        if (response?.status === 'success' && response.data) {
          return response.data;
        }
        return response;
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Configuration", id },
        { type: "Configuration", id: "LIST" },
      ],
    }),

    // ✅ DELETE configuration
    deleteConfiguration: builder.mutation({
      query: (id) => ({ 
        url: `/configurations/${id}`, 
        method: "delete" 
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Configuration", id },
        { type: "Configuration", id: "LIST" },
      ],
    }),

    // ✅ TOGGLE status
    toggleConfigurationStatus: builder.mutation({
      query: (id) => ({ 
        url: `/configurations/${id}/toggle-status`, 
        method: "patch" 
      }),
      transformResponse: (response) => {
        if (response?.status === 'success' && response.data) {
          return response.data;
        }
        return response;
      },
      invalidatesTags: (result, error, id) => [
        { type: "Configuration", id },
        { type: "Configuration", id: "LIST" },
      ],
    }),

    // ✅ DUPLICATE configuration
    duplicateConfiguration: builder.mutation({
      query: ({ id, ...data }) => ({ 
        url: `/configurations/${id}/duplicate`, 
        method: "post", 
        data 
      }),
      transformResponse: (response) => {
        if (response?.status === 'success' && response.data) {
          return response.data;
        }
        return response;
      },
      invalidatesTags: [{ type: "Configuration", id: "LIST" }],
    }),
  }),
});

export const {
  useGetAllConfigurationsQuery,
  useGetConfigurationByNameQuery,
  useGetConfigurationByIdQuery,
  useCreateConfigurationMutation,
  useUpdateConfigurationMutation,
  useDeleteConfigurationMutation,
  useToggleConfigurationStatusMutation,
  useDuplicateConfigurationMutation,
} = configurationApi;
