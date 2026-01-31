
import RoleAndPermissionService from "../services/roleAndPermissionService.js";

class RoleAndPermissionController{
  createRole = async (req, res) => {
    try {
      const result = await RoleAndPermissionService.createRole(req.body);
      res.status(result.responseCode).json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  };
}


export default new RoleAndPermissionController();