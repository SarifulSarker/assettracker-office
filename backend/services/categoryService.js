import { PrismaClient } from "@prisma/client";
import { SuccessResponse, ErrorResponse } from "../utils/return.js";

const prisma = new PrismaClient();

class CategoryService {
  // CREATE
  async createCategory(data) {
    try {
      if (!data.name) return ErrorResponse(400, "Category name is required");

      const category = await prisma.category.create({
        data: {
          name: data.name,
          parentId: data.parentId || null,
        },
      });

      return SuccessResponse(201, "Category created successfully", category);
    } catch (error) {
      return ErrorResponse(500, error.message || "Failed to create category");
    }
  }

  // GET ALL
  async getAllCategories({ page, perpage, search }) {
    try {
      if (!page || !perpage)
        return ErrorResponse(400, "Page and perpage are required");

      const allCategories = await prisma.category.findMany({
        orderBy: { id: "desc" },
      });

      let parentCategories = allCategories.filter((c) => c.parentId === null);

      parentCategories = parentCategories.map((parent) => ({
        ...parent,
        children: allCategories.filter((c) => c.parentId === parent.id),
      }));

      if (search) {
        const terms = search.trim().split(/\s+/);
        parentCategories = parentCategories.filter((parent) =>
          terms.every((term) =>
            parent.name.toLowerCase().includes(term.toLowerCase())
          )
        );
      }

      const total = parentCategories.length;
      const start = (page - 1) * perpage;
      const paginatedCategories = parentCategories.slice(
        start,
        start + perpage
      );

      return SuccessResponse(200, "Categories fetched successfully", {
        categories: paginatedCategories,
        total,
        page,
        perpage,
      });
    } catch (error) {
      return ErrorResponse(500, error.message || "Server Error");
    }
  }

  // GET SINGLE
  async getCategoryById(id) {
    try {
      if (!id) return ErrorResponse(400, "Category ID is required");

      const category = await prisma.category.findUnique({
        where: { id: Number(id) },
        include: { parent: true, children: true },
      });

      if (!category) return ErrorResponse(404, "Category not found");

      return SuccessResponse(200, "Category fetched successfully", category);
    } catch (error) {
      return ErrorResponse(500, error.message || "Failed to fetch category");
    }
  }

  // UPDATE
  async updateCategory(id, data) {
    try {
      if (!id) return ErrorResponse(400, "Category ID is required");
      if (!data.name) return ErrorResponse(400, "Category name is required");

      const updated = await prisma.category.update({
        where: { id: Number(id) },
        data: {
          name: data.name,
          parentId: data.parentId ?? undefined,
          is_active: data.is_active ?? undefined,
        },
      });

      return SuccessResponse(200, "Category updated successfully", updated);
    } catch (error) {
      return ErrorResponse(500, error.message || "Failed to update category");
    }
  }

  // DELETE
  async deleteCategoryOrSub(id) {
    try {
      if (!id) return ErrorResponse(400, "Category ID is required");

      const categoryId = Number(id);

      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category)
        return ErrorResponse(404, "Category or Subcategory not found");

      if (category.parentId === null) {
        // delete parent + children
        await prisma.category.deleteMany({ where: { parentId: categoryId } });
        await prisma.category.delete({ where: { id: categoryId } });

        return SuccessResponse(
          200,
          "Category and all subcategories deleted successfully"
        );
      } else {
        // delete subcategory
        await prisma.category.delete({ where: { id: categoryId } });
        return SuccessResponse(200, "Subcategory deleted successfully");
      }
    } catch (error) {
      return ErrorResponse(500, error.message || "Failed to delete category");
    }
  }
}

export default new CategoryService();
