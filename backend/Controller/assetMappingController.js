import AssetAssignmentService from "../services/assetMappingService.js";

class AssetAssignmentController {
async assignAssets(req, res) {
  try {
    const { employeeId, assetUnitIds } = req.body;

    const result = await AssetAssignmentService.assignAssetsToEmployee(
      employeeId,
      
      assetUnitIds,
      req.user,
    );

    return res.status(result.responseCode || 200).json(result);
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
     
      return res.status(result.responseCode || 200).json(result);
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
      const uid = req.params.uid;
      const result = await AssetAssignmentService.getEmployeesByAsset(uid);
     
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

  // Controller: unassign multiple assets
// ---------------------- controllers/assetAssignmentController.js ----------------------
async unassignAssets(req, res) {
  try {
    // Expect an array of assetUnitIds from frontend
    const { assetUnitIds } = req.body;

    if (
      !assetUnitIds ||
      !Array.isArray(assetUnitIds) ||
      assetUnitIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "assetUnitIds array is required",
      });
    }

    // Call service
    const response = await AssetAssignmentService.unassignAssetsService(assetUnitIds);

    return res.status(response.responseCode || 200).json(response);
  } catch (error) {
    console.error("Unassign Assets Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

  async getUnassignedAssets(req, res) {
    try {
      const { search } = req.query;

      const response = await AssetAssignmentService.getUnassignedAssetUnitsService({
        search,
      });

      return res.status(response.statusCode || 200).json(response);
    } catch (error) {
      console.error("get unassing Asset Controller Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // log by context
  async getLogsByAsset(req, res) {
    try {
      const assetUId = req.params.assetUId;
      const context = req.params.context; // from dropdown selection

      const result = await AssetAssignmentService.getLogsByAssetAndContext(
        assetUId,
        context,
      );
      return res.status(result.responseCode || 200).json(result);
    } catch (error) {
      console.error("AssetLogController Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async getAssetDetails(req, res) {
    try {
      const { uid } = req.params;

      const { context = "ALL" } = req.query;

      const response = await AssetAssignmentService.getAssetDetails(
        uid,
        context,
      );

      return res.status(response.responseCode || 200).json(response);
    } catch (err) {
      console.error("AssetController Error:", err);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }

  //for report

  async getReportData(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const exportAll = req.query.exportAll === "true"; 

      const result = await AssetAssignmentService.getAssetAssignmentData(
        page,
        pageSize,
        exportAll,
      );

      return res.status(result.responseCode).json(result);
    } catch (error) {
      console.error("Get Report Data Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
}

export default new AssetAssignmentController();
