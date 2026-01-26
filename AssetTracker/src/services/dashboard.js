import httpRequest from "../helpers/httpRequest.js";

export const getAssetOverviewApi = async () => {
  const data = await httpRequest.get("/dashboard/asset-overview");
  return data;
};

export const getAssetCategoryOverviewApi = async () => {
  const data = await httpRequest.get("/dashboard/assets-by-category");
  return data;
};

export const getAssetDepartmentOverviewApi = async () => {
  const data = await httpRequest.get("/dashboard/assets-by-department");
  return data;
};
