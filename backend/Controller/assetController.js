import assetService from "../services/assetService.js";

class AssetController {
  // CREATE
  async createAsset(req, res) {
    try {
      const result = await assetService.createAsset(
        req.body,
        req.files, // ✅ images here
        req.user,
      );


     
       
      res.status(result.responseCode).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // GET ALL
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page, 10);
      const perpage = parseInt(req.query.pageSize, 10) || 10;
      const search = req.query.search || "";
      let status = req.query.status;

      // Convert status string to boolean if defined
      if (status !== undefined) {
        status = status === "true"; // query string is always string
      }

      const result = await assetService.getAllAssets({
        page,
        perpage,
        search,
        status,
        issuer: req.user,
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
      const result = await assetService.getAssetById(req.params.uid);
      res.status(result.responseCode).json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateAsset(req, res) {
    try {
      const purchasePrice = req.body.purchasePrice;
      req.body.purchasePrice =
        purchasePrice !== undefined && purchasePrice !== ""
          ? parseFloat(purchasePrice)
          : null;

      const result = await assetService.updateAsset(
        req.params.uid,
        req.body, // <-- Form fields
        req.user,
        req.files, // <-- multer parsed files
      );
     
      res.status(result.responseCode).json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // DELETE
  async deleteAsset(req, res) {
    try {
      const result = await assetService.deleteAsset(req.params.uid, req.user);
      res.status(result.responseCode).json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new AssetController();
