import httpRequest from "../helpers/httpRequest.js";

// GET ALL DESIGNATIONS
export const getAllDesignationsApi = async ({ page, perpage, search }) => {
  return httpRequest.get("/designation/get-all-designation", {
    page,
    perpage,
    search,
  });
};

// GET SINGLE DESIGNATION BY ID
export const getDesignationByIdApi = async (id) => {
  if (!id) throw new Error("Designation ID is required");
  return httpRequest.get(`/designation/${id}`);
};

// CREATE DESIGNATION
export const createDesignationApi = async (data) => {
  if (!data) throw new Error("Designation data is required");
  return httpRequest.post("/designation/create-designation", data);
};

// UPDATE DESIGNATION
export const updateDesignationApi = async ({ id, data }) => {
  if (!id) throw new Error("Designation ID is required");
  if (!data) throw new Error("Designation data is required");
  return httpRequest.put(`/designation/${id}`, data);
};

// DELETE DESIGNATION
export const deleteDesignationApi = async (id) => {
  if (!id) throw new Error("Designation ID is required");
  return httpRequest.delete(`/designation/${id}`);
};
