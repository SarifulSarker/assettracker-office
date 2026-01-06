import httpRequest from "../helpers/httpRequest.js"; // adjust path if needed

const BASE_URL = "/brand";

// Get all brands
export const getAllBrandsApi = async ({ page, pageSize, search, status }) => {
  try {
    const response = await httpRequest.get(`${BASE_URL}/get-all-brand`, {
      page,
      pageSize,
      search,
      status,
    });
    return response;
  } catch (error) {
    console.error("Error fetching all brands:", error);
    throw error;
  }
};

// Get brand by ID
export const getBrandByIdApi = async (id) => {
  try {
    const response = await httpRequest.get(`${BASE_URL}/${id}`);
    return response;
  } catch (error) {
    console.error(`Error fetching brand with ID ${id}:`, error);
    throw error;
  }
};

// Create brand
export const createBrandApi = async (data) => {
  try {
    const response = await httpRequest.post(`${BASE_URL}/create-brand`, data);
    return response;
  } catch (error) {
    console.error("Error creating brand:", error);
    throw error;
  }
};

// Update brand
export const updateBrandApi = async ({ id, data }) => {
  try {
    const response = await httpRequest.put(`${BASE_URL}/${id}`, data);
    return response;
  } catch (error) {
    console.error(`Error updating brand with ID ${id}:`, error);
    throw error;
  }
};

// Delete brand
export const deleteBrandApi = async (id) => {
  try {
    const response = await httpRequest.delete(`${BASE_URL}/${id}`);
    return response;
  } catch (error) {
    console.error(`Error deleting brand with ID ${id}:`, error);
    throw error;
  }
};
