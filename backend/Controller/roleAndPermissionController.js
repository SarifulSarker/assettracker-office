import RoleAndPermissionService from "../services/roleAndPermissionService.js";

class RoleAndPermissionController {
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

  async getRoles(req, res) {
    try {
      const page = parseInt(req.query.page, 10);
      const perpage = parseInt(req.query.perpage, 10);
      const search = req.query.search || "";

      if (!page || !perpage) {
        return res.status(400).json({
          responseCode: 400,
          success: false,
          message: "page and pageSize are required",
        });
      }

      const result = await RoleAndPermissionService.getAllRoles({ page, perpage, search });

      return res.status(result.responseCode).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        responseCode: 500,
        success: false,
        message: "Internal server error",
      });
    }
  }


  updateRole = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await RoleAndPermissionService.updateRole(
      Number(id),
      req.body
    );

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
