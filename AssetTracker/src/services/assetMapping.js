// services/assetMappingService.js
import httpRequest from "../helpers/httpRequest.js";

// Assign assets to employee
export const assignAssetsToEmployeeApi = async ({ employeeId, assetIds }) => {
  try {
    const data = httpRequest.post("/asset-mapping/", {
      employeeId,
      assetIds,
    });
    return data;
  } catch (err) {
    throw new Error(err?.response?.data?.message || err.message || "API Error");
  }
};

// GET ALL ASSETS ASSIGNED TO A SPECIFIC EMPLOYEE
export const getAssetsByEmployeeApi = async (employeeId) => {
  try {
    if (!employeeId) throw new Error("Employee ID is required");
    const data = httpRequest.get(`/asset-mapping/employee/${employeeId}`);
    return data;
  } catch (err) {
    throw new Error(err?.response?.data?.message || err.message || "API Error");
  }
};

// GET ALL EMPLOYEES ASSIGNED TO A SPECIFIC ASSET
export const getEmployeesByAssetApi = async (uid) => {
  try {
    if (!uid) throw new Error("Asset ID is required");
    const data = httpRequest.get(`/asset-mapping/asset/${uid}`);
    return data;
  } catch (err) {
    throw new Error(err?.response?.data?.message || err.message || "API Error");
  }
};

// Unassign an asset
export const unassignAssetApi = async (assignmentId) => {
  try {
    if (!assignmentId) throw new Error("Assignment ID is required");
    const data = httpRequest.put(`/asset-mapping/unassign/${assignmentId}`);
    return data;
  } catch (err) {
    throw new Error(err?.response?.data?.message || err.message || "API Error");
  }
};

//get unassign asset
export const getUnassignedAssetsApi = async ({  search }) => {
  try {
  //  if (!page || !perpage) throw new Error(" Service Page and perpage are required");

    const data = httpRequest.get("/asset-mapping/unassigned-asset", {
      search ,
    });
  
    return data;
  } catch (err) {
    throw new Error(err?.response?.data?.message || err.message || "API Error");
  }
};

//log by context

export const getAssetLogsByContextApi = async ({ assetUId, context }) => {
  try {
    if (!assetUId) throw new Error("Asset UID is required FS");
  
    const { data } = await httpRequest.get(`/asset-mapping/${assetUId}/${context}`);
    return data; // { success, message, data } from backend
  } catch (err) {
    throw new Error(err?.response?.data?.message || err.message || "API Error");
  }
};