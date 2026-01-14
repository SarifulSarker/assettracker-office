// db.js
import dotenv from "dotenv";
dotenv.config();
import pkg from "pg"; // ES Module import
const { Pool } = pkg;

// PostgreSQL connection configuration
const dbConfig = {
  user: process.env.DATABASE_USER || "postgress", // DB username
  host: process.env.DATABASE_HOST || "127.0.0.1", // DB host
  database: process.env.DATABASE_NAME || "Demo", // Database name
  password: process.env.DATABASE_PASSWORD || "shariful", // DB password
  port: Number(process.env.DATABASE_PORT || 5433), // Default PostgreSQL port
};
const pool = new Pool(dbConfig);

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error("Error connecting to database", err);
  }
  console.log("Database connected successfully ✅");
  release();
});

export default pool; // ES Module export
