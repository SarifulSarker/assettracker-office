import AssetAssignmentService from "../services/assetMappingService.js";

class AssetAssignmentController {
  async assignAssets(req, res) {
    try {
      const { employeeId, assetIds } = req.body;
      const result = await AssetAssignmentService.assignAssetsToEmployee(employeeId, assetIds);

      // use statusCode from service response
      return res.status(result.statusCode || 200).json(result);
    } catch (error) {
      console.error("Assign Assets Controller Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async getAssetsByEmployee(req, res) {
    try {
      const employeeId = parseInt(req.params.id);
      const result = await AssetAssignmentService.getAssetsByEmployee(employeeId);
      return res.status(result.statusCode || 200).json(result);
    } catch (error) {
      console.error("Get Assets By Employee Controller Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async getEmployeesByAsset(req, res) {
    try {
      const assetId = parseInt(req.params.id);
      const result = await AssetAssignmentService.getEmployeesByAsset(assetId);
      return res.status(result.statusCode || 200).json(result);
    } catch (error) {
      console.error("Get Employees By Asset Controller Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async unassingAssets(req, res) {
    try {
      const { assignmentId } = req.params;
      const response = await AssetAssignmentService.unassignAssetService(assignmentId);

      return res.status(response.statusCode || 200).json(response);
    } catch (error) {
      console.error("Unassign Asset Controller Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
}

export default new AssetAssignmentController();
