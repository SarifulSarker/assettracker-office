// controllers/UserController.js
import UserService from "../services/userService.js";

class UserController {
  //create uesr

  async createUser(req, res) {
    try {
      const result = await UserService.createUser(req.body);
      res.status(result.responseCode).json(result);
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
      let status = req.query.status;

      // Convert status to boolean if defined
      if (status !== undefined) {
        status = status === "true"; // query string is always string
      }

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
        status,
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
    const { uid } = req.params;
    const updateData = req.body;

   
    try {
      // 2️⃣ Call service
      const result = await UserService.updateUser(uid, updateData);

      // 3️⃣ Return service result with proper HTTP status
      return res.status(result.responseCode).json(result);
    } catch (error) {
      console.error("Update user error:", error);

      // 4️⃣ Catch unexpected errors
      return res
        .status(500)
        .json({
          responseCode: 500,
          success: false,
          message: error.message || "Server Error",
          data: null,
        });
    }
  }

  async deleteUser(req, res) {
    const { uid } = req.params;

    try {
      const deletedUser = await UserService.deleteUser(uid, req);

      // if (!deletedUser) {
      //   return res.status(404).json({ message: "User not found" });
      // }

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
    const { uid } = req.params;

    const result = await UserService.getUserById(uid);

    return res.status(result.status).json(result);
  }
}

export default new UserController();
