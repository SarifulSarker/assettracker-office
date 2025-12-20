
import httpRequest from "../helpers/httpRequest.js"; // adjust path if needed

const BASE_URL = "/brand";

// Get all brands
export const getAllBrandsApi = async ({ page, pageSize, search }) => {
 
  return httpRequest.get(`${BASE_URL}/get-all-brand`, {
    page,
    pageSize,
    search,
  });
};

// Get brand by ID
export const getBrandByIdApi = async (id) => {
  return httpRequest.get(`${BASE_URL}/${id}`);
};

// Create brand
export const createBrandApi = async (data) => {
  try {
    const response =  httpRequest.post(`${BASE_URL}/create-brand`, data);

    return response;
  } catch (e) {
  
  }
};

// Update brand
export const updateBrandApi = async ({ id, data }) => {
  return httpRequest.put(`${BASE_URL}/${id}`, data);
};

// Delete brand
export const deleteBrandApi = async (id) => {
  return httpRequest.delete(`${BASE_URL}/${id}`);
};
