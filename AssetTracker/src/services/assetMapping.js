// services/assetMappingService.js
import httpRequest from "../helpers/httpRequest.js";


export const assignAssetsToEmployeeApi = async ({ employeeId, assetIds }) => {
  try {
    const data =  httpRequest.post("/asset-mapping/", {
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
  if (!employeeId) throw new Error("Employee ID is required");
  const data = httpRequest.get(`/asset-mapping/employee/${employeeId}`);
  //console.log(data)
  return data;
};

// GET ALL EMPLOYEES ASSIGNED TO A SPECIFIC ASSET
export const getEmployeesByAssetApi = async (assetId) => {
  if (!assetId) throw new Error("Asset ID is required");
  return httpRequest.get(`/asset-mapping/asset/${assetId}`);
};

export const unassignAssetApi = (assignmentId) => {
  return httpRequest.put(`asset-mapping/unassign/${assignmentId}`);
};
