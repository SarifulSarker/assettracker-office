// controllers/departmentController.js
import DepartmentService from "../services/departmentService.js";

class departmentController {
  // Create department
  async create(req, res) {
    const result = await DepartmentService.createDepartment(req.body);
    return res.status(result.responseCode).json(result);
  }

  // Get all departments
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page, 10);
      const perpage = parseInt(req.query.pageSize, 10);
      const search = req.query.search || "";

      if (!page || !perpage) {
        return res.status(400).json({
          success: false,
          message: "page and pageSize are required",
        });
      }

      const result = await DepartmentService.getAllDepartments({
        page,
        perpage,
        search,
      });

      return res.status(result.responseCode).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get single department
  async getDepartmentById(req, res) {
    const result = await DepartmentService.getDepartmentById(req.params.id);
    return res.status(result.responseCode).json(result);
  }

  // Update department
  async update(req, res) {
    const result = await DepartmentService.updateDepartment(
      req.params.id,
      req.body
    );
    return res.status(result.responseCode).json(result);
  }

  // Delete department
  async delete(req, res) {
    const result = await DepartmentService.deleteDepartment(req.params.id);
    return res.status(result.responseCode).json(result);
  }
}

export default new departmentController();
