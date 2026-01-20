// db.js
import dotenv from "dotenv";
dotenv.config();
import pkg from "pg"; // ES Module import
const { Pool } = pkg;

// PostgreSQL connection configuration
const dbConfig = {
  user: process.env.DATABASE_USER , // DB username
  host: process.env.DATABASE_HOST , // DB host
  database: process.env.DATABASE_NAME , // Database name
  password: process.env.DATABASE_PASSWORD , // DB password
  port: Number(process.env.DATABASE_PORT), // Default PostgreSQL port
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
