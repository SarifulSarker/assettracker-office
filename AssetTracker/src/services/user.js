import httpRequest from "../helpers/httpRequest.js"; 
// তোমার httpRequest file যেখানে আছে সেই path অনুযায়ী ঠিক করে দিও

// Get all users with pagination

export const GetUserApi = async ({ page, pageSize, search, status }) => {
  // status can be true, false, or undefined
  return httpRequest.get("/user", { page, pageSize, search, status });
};


//create user
export const createUserApi = async (data) => {
  try {
    const response =  httpRequest.post(`user/create-user`, data);
console.log("fron yservice");
    return response;
  } catch (e) {
  
  }
};
// Update user

export const updateUserApi = async ({ uid, data }) => {
  try {
    const response =  httpRequest.put(`/user/${uid}`, data);
     
    return  response;
   
  } catch (error) {
    console.error("Update User API Error:", error);

    // যদি axios use করো
    const message =
      error.response?.data?.message || error.message || "Unknown error";

    return {
      success: false,
      error: message,
    };
  }
};
// Delete user
export const deleteUserApi = async (uid) => {
   const res  = httpRequest.delete(`/user/${uid}`);
 
   return res;
};

// Get a user by ID
export const getUserByIdApi = async (uid) => {
  return httpRequest.get(`/user/${uid}`);
};
