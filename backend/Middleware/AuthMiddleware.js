import redisClient from "../redis-client.js";
import jwt from "jsonwebtoken";

import env from "dotenv"; // ✅
import { generateTokenKey } from "../utils/tokenKeyGenerator.js";

class AuthMiddleware {
  // AUTH FUNCTION
  async authGuard(req, res, next) {
    try {
      // 1. Get Token
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }

      const token = authHeader.split(" ")[1];

      // 3. Verify JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Redis e token check
      const tokenKey = generateTokenKey(decoded.userId);

      const redisToken = await redisClient.get(tokenKey);

      if (!redisToken) {
        return res.status(401).json({ message: "Invalid token" });
      }
      if (redisToken !== token) {
        return res.status(401).json({ message: "Token not match" });
      }

      // 4. Attach user info to request
      req.user = {
        id: decoded.userId,
        superAdmin: decoded.userId == 36 ? true : false,
      };

      next();
    } catch (error) {
      //  console.log("AUTH ERROR:", error);

      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }

      return res.status(401).json({ message: "Invalid token" });
    }
  }
}

export default new AuthMiddleware();
