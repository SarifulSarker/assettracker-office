import httpRequest from "../helpers/httpRequest.js"; 
// তোমার httpRequest file যেখানে আছে সেই path অনুযায়ী ঠিক করে দিও

// Get all users with pagination

export const GetUserApi = async ({ page, pageSize, search }) => {
  return httpRequest.get("/user", { page, pageSize, search });
};

//create user
export const createUserApi = async (data) => {
  try {
    const response = await httpRequest.post(`${BASE_URL}/create-user`, data);

    return response;
  } catch (e) {
  
  }
};
// Update user
export const updateUserApi = async ({ id, data }) => {
  return httpRequest.put(`/user/${id}`, data);
};

// Delete user
export const deleteUserApi = async (id) => {
  return httpRequest.delete(`/user/${id}`);
};

// Get a user by ID
export const getUserByIdApi = async (id) => {
  return httpRequest.get(`/user/${id}`);
};
