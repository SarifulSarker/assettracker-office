import designationService from "../services/designationService.js";

class DesignationController {
  // CREATE
  async createDesignation(req, res) {
    try {
      const result = await designationService.createDesignation(req.body);
      return res.status(result.responseCode).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // GET ALL
async getDesignations(req, res) {
  try {
    const page = parseInt(req.query.page, 10);
    const perpage = parseInt(req.query.perpage, 10) || 10;
    const search = req.query.search || "";
    const status = req.query.status; // "active" / "inactive"
   

    const result = await designationService.getDesignations({
      page,
      perpage,
      search,
      status,
    });

    return res.status(result.responseCode).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}


  // GET BY ID
  async getDesignationById(req, res) {
    try {
      const result = await designationService.getDesignationById(req.params.id);
      return res.status(result.responseCode).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // UPDATE
  async updateDesignation(req, res) {
    try {
      const result = await designationService.updateDesignation(
        req.params.id,
        req.body
      );
      return res.status(result.responseCode).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // DELETE
  async deleteDesignation(req, res) {
    try {
      const result = await designationService.deleteDesignation(req.params.id);
      return res.status(result.responseCode).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}

export default new DesignationController();
