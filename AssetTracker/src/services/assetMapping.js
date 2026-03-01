// services/assetMappingService.js
import httpRequest from "../helpers/httpRequest.js";

// Assign assets to employee
export const assignAssetsToEmployeeApi = async ({ employeeId, assetUnitIds }) => {
  try {
    const { data } = await httpRequest.post("/asset-mapping/", {
      employeeId,
      assetUnitIds,
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
// ---------------------- services/assetMapping.js ----------------------
export const unassignAssetApi = async (assetUnitIds) => {
  try {
    if (!assetUnitIds || !assetUnitIds.length) {
      throw new Error("No asset unit IDs provided");
    }

    const { data } = await httpRequest.put("/asset-mapping/unassign-assets", {
      assetUnitIds, // ✅ send array of assetUnitId
    });

    return data;
  } catch (err) {
    throw new Error(err?.response?.data?.message || err.message || "API Error");
  }
};
//get unassign asset
export const getUnassignedAssetsApi = async ({ search }) => {
  try {
    //  if (!page || !perpage) throw new Error(" Service Page and perpage are required");

    const data = httpRequest.get("/asset-mapping/getunassigned-asset", {
      search,
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

    const { data } = await httpRequest.get(
      `/asset-mapping/${assetUId}/${context}`,
    );
    return data; // { success, message, data } from backend
  } catch (error) {
    console.error("getting getAssetLogsByContextApi api", error);
    throw error;
  }
};

export const getAssetsReportApi = async ({page, pageSize,exportAll}) => {
  try {
    const data = await httpRequest.get("/asset-mapping/getAssetReport",{
      page,pageSize,exportAll
    });
    return data?.data || "bal";
  } catch (error) {
    console.error("getting assets report api", error);
    throw error;
  }
};
