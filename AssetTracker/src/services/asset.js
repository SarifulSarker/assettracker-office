import httpRequest from "../helpers/httpRequest.js";

export const getAllAssetsApi = async ({ page, perpage, search, status }) => {
 
  const data = await httpRequest.get("/asset/get-all-assets", {
    page,
    perpage,
    search,
    status,
  });

  return data;
};

// GET SINGLE ASSET
export const getAssetByIdApi = async (uid) => {
  if (!uid) throw new Error("Asset ID is required");
  return httpRequest.get(`/asset/${uid}`);
};

// CREATE ASSET
export const createAssetApi = async (data) => {
  if (!data) throw new Error("Asset data is required");
  return httpRequest.post("/asset/create-asset", data);
};

// // UPDATE ASSET

export const updateAssetApi = async (uid, data) => {
  if (!uid) throw new Error("Asset ID is required");
  if (!data) throw new Error("Asset data is required");

  return httpRequest.put(`/asset/${uid}`, data);
};

// DELETE ASSET
export const deleteAssetApi = async (uid) => {
  if (!uid) throw new Error("Asset ID is required");
  return httpRequest.delete(`/asset/${uid}`);
};
