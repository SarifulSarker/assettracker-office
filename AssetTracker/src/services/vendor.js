import httpRequest from "../helpers/httpRequest.js";

// Get all vendors with pagination + search
export const getAllVendorsApi = ({ page, pageSize, search ,status}) => {
  return httpRequest.get("/vendor/get-all-vendor", {
    page,
    pageSize,
    search,
    status,
  });
};

// Get vendor by ID
export const getVendorByIdApi = (id) => {
  return httpRequest.get(`/vendor/${id}`);
};

// Create vendor
export const createVendorApi = (data) => {
  try {
     return httpRequest.post("/vendor/create-vendor", data);
  } catch (error) {
      throw error.response?.data || error;
  }
};

// Update vendor
export const updateVendorApi = ({ id, data }) => {
  return httpRequest.put(`/vendor/${id}`, data);
};

// Delete vendor
export const deleteVendorApi = (id) => {
  return httpRequest.delete(`/vendor/${id}`);
};
