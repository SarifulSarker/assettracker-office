import httpRequest from "../helpers/httpRequest.js";
// adjust the path according to your project structure

// GET ALL CATEGORIES
// category.js
export const getAllCategoriesApi = async ({ page, perpage, search }) => {
  return httpRequest.get("/category/get-all-category", {
    page,
    perpage,
    search,
  });
};

// GET SINGLE CATEGORY BY ID
export const getCategoryByIdApi = async (id) => {
  if (!id) throw new Error("Category ID is required");
  return httpRequest.get(`/category/${id}`);
};

// CREATE CATEGORY
export const createCategoryApi = async (data) => {
  if (!data) throw new Error("Category data is required");
  return httpRequest.post("/category/create-category", data);
};

// UPDATE CATEGORY
export const updateCategoryApi = async ({ id, data }) => {
  if (!id) throw new Error("Category ID is required");
  if (!data) throw new Error("Category data is required");
  return httpRequest.put(`/category/${id}`, data);
};

// DELETE CATEGORY
export const deleteCategoryApi = async (id) => {
  if (!id) throw new Error("Category ID is required");
  return httpRequest.delete(`/category/${id}`);
};
