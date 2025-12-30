import employeeService from "../services/employeeService.js";

class EmployeeController {
  async createEmployee(req, res) {
    const result = await employeeService.createEmployee(req.body);
    return res.status(result.responseCode).json(result);
  }

async getEmployees(req, res) {
  try {
    const page = Number(req.query.page);
    const perpage = Number(req.query.perpage) || 10;
    const search = req.query.search || "";
    let status = req.query.status; // can be "true" or "false"

    // Convert status string to boolean
    if (status !== undefined) {
      status = status === "true";
    }

    const result = await employeeService.getEmployees({
      page,
      perpage,
      search,
      status, // send boolean to service
    });

    return res.status(result.responseCode).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

  async getEmployeeById(req, res) {
    const result = await employeeService.getEmployeeById(req.params.uid);
    return res.status(result.responseCode).json(result);
  }

  async updateEmployee(req, res) {
    const result = await employeeService.updateEmployee(
      req.params.uid,
      req.body
    );
    return res.status(result.responseCode).json(result);
  }

  async deleteEmployee(req, res) {
    const result = await employeeService.deleteEmployee(req.params.uid);
    return res.status(result.responseCode).json(result);
  }
}

export default new EmployeeController();
