// db.js
import pkg from "pg";           // ES Module import
const { Pool } = pkg;

// PostgreSQL connection configuration
const pool = new Pool({
  user: "postgres",       // DB username
  host: "localhost",      // DB host
  database: "Demo",       // Database name
  password: "shariful",   // DB password
  port: 5432,             // Default PostgreSQL port
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error("Error connecting to database", err);
  }
  console.log("Database connected successfully ✅");
  release();
});

export default pool;       // ES Module export
