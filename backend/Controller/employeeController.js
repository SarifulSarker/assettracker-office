import employeeService from "../services/employeeService.js";

class EmployeeController {
  async createEmployee(req, res) {
    const result = await employeeService.createEmployee(req.body);
    return res.status(result.responseCode).json(result);
  }

  async getEmployees(req, res) {
    const { page, perpage, search } = req.query;

    const result = await employeeService.getEmployees({
      page: Number(page),
      perpage: Number(perpage),
      search: search || "",
    });

    return res.status(result.responseCode).json(result);
  }

  async getEmployeeById(req, res) {
    const result = await employeeService.getEmployeeById(req.params.id);
    return res.status(result.responseCode).json(result);
  }

  async updateEmployee(req, res) {
    const result = await employeeService.updateEmployee(
      req.params.id,
      req.body
    );
    return res.status(result.responseCode).json(result);
  }

  async deleteEmployee(req, res) {
    const result = await employeeService.deleteEmployee(req.params.id);
    return res.status(result.responseCode).json(result);
  }
}

export default new EmployeeController();
