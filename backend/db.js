// db.js
import pkg from "pg";
import 'dotenv/config';

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Error connecting to database", err);
  } else {
    console.log("✅ Database connected successfully");
  }
  release();
});

export default pool;
