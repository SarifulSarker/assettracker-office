import categoryService from "../services/categoryService.js";

class CategoryController {
  async create(req, res) {
    try {
      const data = req.body;
      const result = await categoryService.createCategory(data);

      return res.status(result.responseCode).json(result); // ✅ use responseCode
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: error.message || "Server Error" });
    }
  }

  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const perpage = parseInt(req.query.perpage) || 20;
      const search = req.query.search || "";

      const result = await categoryService.getAllCategories({ page, perpage, search });

      return res.status(result.responseCode).json(result); // ✅ use responseCode
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: error.message || "Server Error" });
    }
  }

  async getOne(req, res) {
    try {
      const id = req.params.id;
      const result = await categoryService.getCategoryById(id);

      return res.status(result.responseCode).json(result); // ✅ use responseCode
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: error.message || "Server Error" });
    }
  }

  async update(req, res) {
    try {
      const id = req.params.id;
      const data = req.body;

      const result = await categoryService.updateCategory(id, data);

      return res.status(result.responseCode).json(result); // ✅ use responseCode
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: error.message || "Server Error" });
    }
  }

  async deleteCategoryOrSub(req, res) {
    try {
      const { id } = req.params;

      const result = await categoryService.deleteCategoryOrSub(id);

      return res.status(result.responseCode).json(result); // ✅ use responseCode
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: error.message || "Server Error" });
    }
  }
}

export default new CategoryController();
