import express from "express";
import cors from "cors";
import redisClient from "../backend/redis-client.js"

import pool from "./db.js";
import dotenv from "dotenv";
import routes from './Routes/index.js'

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;


// -------------------- CORS --------------------
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend URL
    credentials: true,               // allow cookies/auth headers
  })
);

// Middleware
app.use(express.json());

app.use('/api/v1', routes);

// Test route
app.get("/", (req, res) => {
  res.send("Server is running!");
});


// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


