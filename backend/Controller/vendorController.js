// controllers/vendorController.js
import VendorService from "../services/vendorService.js";

class vendorController {
  async createVendor(req, res) {
    const result = await VendorService.createVendor(req.body);
    res.status(result.status).json(result);
  }
  async getAllVendors(req, res) {
    const page = Number(req.query.page) || 1;
    const perpage = Number(req.query.perpage) || 10;
    const search = req.query.search || "";
    let status = req.query.status;

      // Convert status string to boolean if defined
      if (status !== undefined) {
        status = status === "true"; // query string is always string
      }

    const response = await VendorService.getAllVendors({
      page,
      perpage,
      search,
      status,
    });

   // console.log("vendor controller ", response)

    return res.status(response.responseCode).json(response);
  }
  async getVendorById(req, res) {
    const { id } = req.params;
    const result = await VendorService.getVendorById(id);
    res.status(result.status).json(result);
  }

  async updateVendor(req, res) {
    const { id } = req.params;
    const result = await VendorService.updateVendor(id, req.body);
    res.status(result.status).json(result);
  }

  async deleteVendor(req, res) {
    const { id } = req.params;
    const result = await VendorService.deleteVendor(id);
    res.status(result.status).json(result);
  }
}

export default new vendorController();
