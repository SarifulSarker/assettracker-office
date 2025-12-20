// controllers/UserController.js
import UserService from "../services/userService.js";

class UserController {
  //create uesr

  async createUser(req, res) {
    try {
      const result = await UserService.createUser(req.body);
      res.status(result.status).json(result);
    } catch (error) {
      console.error("Create User Error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Server Error",
      });
    }
  }

  //getuser
 // controllers/userController.js

async getUsers(req, res) {
  try {
    const page = parseInt(req.query.page, 10);
    const perpage = parseInt(req.query.pageSize, 10);
    const search = req.query.search || "";

    if (!page || !perpage) {
      return res.status(400).json({
        success: false,
        error: "page and pageSize are required",
      });
    }

    const result = await UserService.getAllUsers({
      page,
      perpage,
      search,
    });

    return res.status(result.status).json(result.data);

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

  async updateUser(req, res) {
    const { id } = req.params;
    const updateData = req.body;

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No data provided to update" });
    }

    try {
      const updatedUser = await UserService.updateUser(id, updateData);

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({
        message: "User updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: error.message });
    }
  }

  async deleteUser(req, res) {
    const { id } = req.params;

    try {
      const deletedUser = await UserService.deleteUser(id, req);

      if (!deletedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({
        message: "User deleted successfully",
        data: deletedUser,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  //get user by id
  async getUserById(req, res) {
    const { id } = req.params;

    const result = await UserService.getUserById(id);

    return res.status(result.status).json(result);
  }
}

export default new UserController();
