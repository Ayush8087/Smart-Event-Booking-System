import mysql from "mysql2/promise";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

let pool; // Singleton pool

export async function createConnectionPool() {
  if (pool) return pool;

  let config;

  // ✅ Use the DATABASE_URL if present
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      config = {
        host: url.hostname,
        port: Number(url.port) || 3306,
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        database: url.pathname.replace("/", "") || "defaultdb",
        ssl: {
          rejectUnauthorized: false,
          ca: fs.existsSync("./ca.pem") ? fs.readFileSync("./ca.pem") : undefined,
        },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      };

      console.log(
        `🔌 Connecting via DATABASE_URL: ${config.user}@${config.host}:${config.port}/${config.database}`
      );
    } catch (err) {
      console.error("❌ Invalid DATABASE_URL format:", err.message);
      throw new Error(
        "Invalid DATABASE_URL format. Expected: mysql://user:password@host:port/database"
      );
    }
  } else {
    throw new Error("DATABASE_URL not found in .env");
  }

  pool = mysql.createPool(config);

  try {
    await pool.query("SELECT 1 AS ok");
    console.log("✅ Database connected successfully (Aiven via URI)");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    if (err.code === "ER_ACCESS_DENIED_ERROR") {
      console.error("💡 Check your Aiven password or user permissions.");
    }
    throw err;
  }

  return pool;
}

export function getPool() {
  if (!pool) {
    throw new Error("DB pool not initialized. Call createConnectionPool() first.");
  }
  return pool;
}
