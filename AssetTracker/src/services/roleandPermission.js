import httpRequest from "../helpers/httpRequest.js";

const BASE_URL = "/role";

export const GetRoleAndPermissionApi = async ({ page, perpage, search }) => {
  // status can be true, false, or undefined

  const data = httpRequest.get(`${BASE_URL}/getall-roles`, {
    page,
    perpage,
    search,
  });

  return data;
};

//create user
export const createRoleAndPermissionApi = async (data) => {
  try {
    const response = httpRequest.post(`${BASE_URL}/create-roles`, data);

    return response;
  } catch (e) {
    console.log(e);
  }
};
// Update user

export const updateRoleAndPermissionApi = async (id, data) => {
  try {
    const response = await httpRequest.put(
      `${BASE_URL}/update-roles/${id}`,
      data,
    );

    return response;
  } catch (e) {
    console.log(e);
    throw e;
  }
};
