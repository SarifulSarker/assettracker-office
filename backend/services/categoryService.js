import { PrismaClient } from "@prisma/client";
import { SuccessResponse, ErrorResponse } from "../utils/return.js";
import { generateUID } from "../utils/uuid.js";
const prisma = new PrismaClient();

class CategoryService {
  // CREATE
  async createCategory(data) {
    try {
      if (!data.name) return ErrorResponse(400, "Category name is required");

      const category = await prisma.category.create({
        data: {
          name: data.name,
          uid: await generateUID(10),
          parentId: data.parentId || null,
        },
      });

      return SuccessResponse(201, "Category created successfully", category);
    } catch (error) {
      return ErrorResponse(500, error.message || "Failed to create category");
    }
  }

  // GET ALL
  // GET ALL
  async getAllCategories({ page, perpage, search, status }) {
    try {
      if (!page || !perpage)
        return ErrorResponse(400, "Page and perpage are required");

      // Fetch all parents
      const parentCategories = await prisma.category.findMany({
        where: {
          parentId: null,
          ...(search
            ? { name: { contains: search, mode: "insensitive" } }
            : {}),
        },
        include: {
          children: true, // fetch all children first
        },
        orderBy: { id: "desc" },
      });

      // Filter parent and children by status in JS
      const filteredCategories = parentCategories
        .map((parent) => ({
          ...parent,
          children: parent.children.filter((child) =>
            status !== undefined ? child.is_active === status : true
          ),
        }))
        .filter((parent) =>
          status !== undefined
            ? parent.is_active === status || parent.children.length > 0
            : true
        );

      const total = filteredCategories.length;

      // Pagination
      const start = (page - 1) * perpage;
      const paginatedCategories = filteredCategories.slice(
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
      console.error(error);
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
        select: { id: true, parentId: true, is_active: true, name: true },
      });

      if (!category)
        return ErrorResponse(404, "Category or Subcategory not found");

      if (category.parentId === null) {
        // parent category toggle + children toggle
        // toggle parent
        const updatedParent = await prisma.category.update({
          where: { id: categoryId },
          data: { is_active: !category.is_active },
        });

        // toggle all children to the same status as parent
        await prisma.category.updateMany({
          where: { parentId: categoryId },
          data: { is_active: updatedParent.is_active },
        });

        return SuccessResponse(
          200,
          `Category and all subcategories ${
            updatedParent.is_active ? "activated" : "deactivated"
          } successfully`
        );
      } else {
        // toggle subcategory
        const updatedSub = await prisma.category.update({
          where: { id: categoryId },
          data: { is_active: !category.is_active },
        });

        return SuccessResponse(
          200,
          `Subcategory ${
            updatedSub.is_active ? "activated" : "deactivated"
          } successfully`
        );
      }
    } catch (error) {
      return ErrorResponse(500, error.message || "Failed to toggle category");
    }
  }
}

export default new CategoryService();
