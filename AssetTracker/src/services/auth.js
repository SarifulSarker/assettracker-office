import axios from "axios";

export const SignOutApi = async () => {
const response = await axios.post("(http://localhost:3000/api/v1/auth/logout)", {
withCredentials: true, // if using cookies
});
return response.data;
};
