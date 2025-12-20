// controllers/BrandController.js
import BrandService from "../services/brandService.js";

class BrandController {
  // GET all brands
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page, 10);
      const perpage = parseInt(req.query.pageSize, 10);
      const search = req.query.search || "";

      const result = await BrandService.getAllBrands({ page, perpage, search });

      return res.status(result.responseCode).json(result);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  // POST create brand
  async createBrand(req, res) {
    try {
      const result = await BrandService.createBrand(req.body);
      return res.status(result.responseCode).json(result);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  // PUT update brand
  async updateBrand(req, res) {
    try {
       console.log("from brandservice",req.id)
      const { id } = req.params;
      const result = await BrandService.updateBrand(id, req.body);
      return res.status(result.responseCode).json(result);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  // DELETE brand
  async deleteBrand(req, res) {
    try {
      const { id } = req.params;
      const result = await BrandService.deleteBrand(id);
      return res.status(result.responseCode).json(result);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  // GET brand by ID
  async getBrandById(req, res) {
    try {
      const { id } = req.params;
     // console.log("getbyid", id)
      const result = await BrandService.getBrandById(id);
      return res.status(result.responseCode).json(result);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
}

export default new BrandController();
