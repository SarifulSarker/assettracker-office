import dashboardService from "../services/dashboardService.js";

class DashboardController {
  async getAssetOverview(req, res) {
    try {
      const response = await dashboardService.getAssetOverview();
      return res.status(response.statusCode || 200).json(response);
    } catch (error) {
      console.error("Error in getAssetOverview:", error);
      return res.status(500).json({
        statusCode: 500,
        success: false,
        message: "Something went wrong",
        error: error.message,
      });
    }
  }

  // 🔹 New: Category Column Chart API
  async getAssetsByCategory(req, res) {
    try {
      const response = await dashboardService.getAssetsByCategory();
      return res.status(response.statusCode || 200).json(response);
    } catch (error) {
      console.error("Error in getAssetsByCategory:", error);
      return res.status(500).json({
        statusCode: 500,
        success: false,
        message: "Something went wrong",
        error: error.message,
      });
    }
  }

  async departmentWiseAssetCount(req, res){
    try {
       const response = await dashboardService.getDepartmentWiseAssetCount();
       return res.status(response.status || 200).json(response);

    } catch (error) {
      console.error("Error in departmentWiseAssetCount:", error);
      return res.status(500).json({
        statusCode: 500,
        success: false,
        message: "Something went wrong",
        error: error.message,
      });
    }
  }
}

export default new DashboardController();
