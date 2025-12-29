
// import axiosInstance from "../axiosInstance";

// const roleApi = {

//     getAllRoles: async () => {

//         try {
//             const res = await axiosInstance.get('/role');
//             console.log(res, "response");
//             return {
//                 success: true,
//                 data: res.data,
//             };
//         }
//         catch (err) {
//             console.log(err, "error")
//         }
//     }


// }

// export default roleApi;



// src/lib/api/rolesApi.js
import axiosInstance from "../axiosInstance";

export const RolesApi = {
    // Get all roles
    getAllRoles: async () => {
        try {
            const response = await axiosInstance.get(`/roles`);
            return {
                success: true,
                data: response.data,     // { success, roles }
            };
        } catch (error) {
            console.error("Error fetching roles:", error);
            return {
                success: false,
                error: error.response?.data?.error || error.message,
            };
        }
    },

    // Get single role by ID
    getById: async (id) => {
        try {
            const response = await axiosInstance.get(`/roles/${id}`);
            return {
                success: true,
                data: response.data,     // { success, role }
            };
        } catch (error) {
            console.error("Error fetching role:", error);
            return {
                success: false,
                error: error.response?.data?.error || error.message,
            };
        }
    },

    // Get all available permissions + module config
    getAvailablePermissions: async () => {
        try {
            const response = await axiosInstance.get(`/roles/permissions/available`);
            return {
                success: true,
                data: response.data,     // { success, permissions, modules }
            };
        } catch (error) {
            console.error("Error fetching available permissions:", error);
            return {
                success: false,
                error: error.response?.data?.error || error.message,
            };
        }
    },

    // Create role
    create: async (payload) => {
        // payload: { name, description, permissions: string[] }
        try {
            const response = await axiosInstance.post(`/roles`, payload);
            return {
                success: true,
                data: response.data,     // { success, role, message }
            };
        } catch (error) {
            console.error("Error creating role:", error);
            return {
                success: false,
                error: error.response?.data?.error || error.message,
            };
        }
    },

    // Update role
    update: async (id, payload) => {
        // payload: { name?, description?, permissions? }
        try {
            const response = await axiosInstance.patch(`/roles/${id}`, payload);
            return {
                success: true,
                data: response.data,     // { success, role, message }
            };
        } catch (error) {
            console.error("Error updating role:", error);
            return {
                success: false,
                error: error.response?.data?.error || error.message,
            };
        }
    },

    // Delete role
    delete: async (id) => {
        try {
            const response = await axiosInstance.delete(`/roles/${id}`);
            return {
                success: true,
                data: response.data,     // { success, message }
            };
        } catch (error) {
            console.error("Error deleting role:", error);
            return {
                success: false,
                error: error.response?.data?.error || error.message,
            };
        }
    },

    // Get users attached to a role
    getUsersByRole: async (id) => {
        try {
            const response = await axiosInstance.get(`/roles/${id}/users`);
            return {
                success: true,
                data: response.data,     // { success, count, users }
            };
        } catch (error) {
            console.error("Error fetching users for role:", error);
            return {
                success: false,
                error: error.response?.data?.error || error.message,
            };
        }
    },
};

export default RolesApi;
