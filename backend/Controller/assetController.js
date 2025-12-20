import assetService from "../services/assetService.js";

class AssetController {
  // CREATE
  async createAsset(req, res) {
    try {
      const result = await assetService.createAsset(req.body);
      res.status(result.responseCode).json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET ALL
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page, 10);
      const perpage = parseInt(req.query.pageSize, 10) || 10;
      const search = req.query.search || "";

     // console.log(page, perpage, "in controller")
      const result = await assetService.getAllAssets({
        page,
        perpage,
        search,
      });

      return res.status(result.responseCode).json(result);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
  // GET BY ID
  async getAssetById(req, res) {
    try {
      const result = await assetService.getAssetById(req.params.id);
      res.status(result.responseCode).json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // UPDATE
  async updateAsset(req, res) {
    try {
      const result = await assetService.updateAsset(req.params.id, req.body);
      console.log(req.body)
      res.status(result.responseCode).json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // DELETE
  async deleteAsset(req, res) {
    try {
      const result = await assetService.deleteAsset(req.params.id);
      res.status(result.responseCode).json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new AssetController();
