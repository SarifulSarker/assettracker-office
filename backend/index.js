import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import redisClient from "./redis-client.js";
import pool from "./db.js";
import routes from "./Routes/index.js";

const app = express();

// ---------------- Environment ----------------
const PORT = process.env.BACKEND_PORT ;
// const FRONTEND_URL = process.env.FRONTEND_URL;

console.log("APP_ENV:", process.env.APP_ENV);
//console.log("Allowed Frontend:", FRONTEND_URL);
console.log("DATABASE URL:", process.env.DATABASE_URL);
// ---------------- CORS ----------------
// app.use(
//   cors({
//     origin: (origin, callback) => {
//       // Postman / server-to-server request
//       if (!origin) return callback(null, true);

//       if (origin === FRONTEND_URL) {
//         callback(null, true);
//       } else {
//         callback(new Error(`CORS blocked: ${origin}`));
//       }
//     },
//     credentials: true,
//     allowedHeaders: ["Content-Type", "Authorization"],

//   })
// );

app.use(
  cors({
    origin: true, // your frontend URL
    credentials: true, // allow cookies/auth headers
  }),
);

// ---------------- Middleware ----------------
app.use(express.json());
// ---------------- Routes ----------------
app.use("/api/v1", routes);

// ---------------- Routes ----------------
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// ---------------- Start Server ----------------
app.listen(PORT, () => {
  console.log(`Server running at PORT:${PORT}`);
});
