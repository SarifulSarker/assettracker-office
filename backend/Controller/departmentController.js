// controllers/departmentController.js
import DepartmentService from "../services/departmentService.js";

class departmentController {
  // Create department
  async create(req, res) {
    const result = await DepartmentService.createDepartment(req.body);
    return res.status(result.responseCode).json(result);
  }

  // Get all departments

// departmentController.js
async getAll(req, res) {
  try {
    const page = parseInt(req.query.page, 10);
    const perpage = parseInt(req.query.pageSize, 10);
    const search = req.query.search || "";
    let status = req.query.status; // "active" | "inactive" | undefined

     // Convert status string to boolean if defined
      if (status !== undefined) {
        status = status === "true"; // query string is always string
      }

    const result = await DepartmentService.getAllDepartments({
      page,
      perpage,
      search,
      status, // 🔥 only boolean or undefined
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
