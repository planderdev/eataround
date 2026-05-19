import mysql, { type Pool } from "mysql2/promise";

let pool: Pool | null = null;

export function getPool() {
  if (pool) return pool;

  pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: true,
    charset: "utf8mb4",
  });

  return pool;
}

export function hasDatabaseConfig() {
  return Boolean(process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME);
}
