import httpRequest from "../helpers/httpRequest.js";

const BASE_URL = "/employee";

// Get all employees with pagination + search
export const getAllEmployeesApi = ({ page, perpage, search }) => {
  const data =  httpRequest.get(`${BASE_URL}/get-all-employee`, {
    page, perpage, search, // query params
  });
  //console.log("form service emp",data)
  return data;
};

// Get employee by ID
export const getEmployeeByIdApi = (id) => {
  return httpRequest.get(`${BASE_URL}/${id}`);
};

// Create employee
export const createEmployeeApi = (data) => {
  return httpRequest.post(`${BASE_URL}/create-employee`, data);
};

// Update employee
export const updateEmployeeApi = ({ id, data }) => {
  return httpRequest.put(`${BASE_URL}/${id}`, data);
};

// Delete employee
export const deleteEmployeeApi = (id) => {
  return httpRequest.delete(`${BASE_URL}/${id}`);
};
