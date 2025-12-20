import httpRequest from "../helpers/httpRequest.js"; 
// adjust the path according to your project structure

// Get all departments with pagination
export const getAllDepartmentsApi = async ({ page, pageSize ,search}) => {
 // return httpRequest.get("/department/get-all-department", { page, pageSize,search });
  return httpRequest.get("/department/get-all-department", { page, pageSize, search });
  
};

// Get department by ID
export const getDepartmentByIdApi = async (id) => {
  return httpRequest.get(`/department/${id}`);
};

// Create department
export const createDepartmentApi = async (data) => {
  return httpRequest.post("/department/create-department", data);
};

// Update department
export const updateDepartmentApi = async ({ id, data }) => {
  return httpRequest.put(`/department/${id}`, data);
};

// Delete department
export const deleteDepartmentApi = async (id) => {
  return httpRequest.delete(`/department/${id}`);
};
