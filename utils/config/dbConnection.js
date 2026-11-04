import mysql from 'mysql2/promise';
import { databaseConfig } from '../../lib/mysql-config.mjs';
let pool;
export function getPool() {
  if (!pool) pool = mysql.createPool(databaseConfig());
  return pool;
}
export const lazyDatabase = {
  execute(...args) { return getPool().execute(...args); },
  getConnection() { return getPool().getConnection(); },
};
export default async function dbConnect() {
  const db = getPool();
  const connection = await db.getConnection();
  connection.release();
  return db;
}
