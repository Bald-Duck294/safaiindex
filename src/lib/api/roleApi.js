
import axiosInstance from "../axiosInstance";

const roleApi = {

    getAllRoles: async () => {

        try {
            const res = await axiosInstance.get('/role');
            console.log(res, "response");
            return {
                success: true,
                data: res.data,
            };
        }
        catch (err) {
            console.log(err, "error")
        }
    }


}

export default roleApi;