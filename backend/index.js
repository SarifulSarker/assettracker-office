import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import redisClient from "./redis-client.js";
import pool from "./db.js";
import routes from "./Routes/index.js";
import path from "path"; // ✅ এটা দরকার
const app = express();

// ---------------- Environment ----------------
const PORT = process.env.BACKEND_PORT;

console.log("APP_ENV:", process.env.APP_ENV);

console.log("DATABASE URL:", process.env.DATABASE_URL);

app.use(
  cors({
    origin: true,
    // origin: ["http://localhost:5173", "http://192.168.0.5:5173"],
    credentials: true,
  }),
);

// ---------------- Middleware ----------------
app.use(express.json());
// ---------------- Routes ----------------
app.use("/api/v1/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/v1", routes);

// ---------------- Routes ----------------
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// ---------------- Start Server ----------------
app.listen(PORT, () => {
  console.log(`Server running at PORT:${PORT}`);
});
