import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import env from './env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve CA certificate path relative to server root
const caCertPath = env.TIDB_CA_PATH
  ? path.resolve(__dirname, '../../', env.TIDB_CA_PATH)
  : path.resolve(__dirname, '../../cert/isrgrootx1.pem');

const sslConfig = {
  minVersion: 'TLSv1.2',
  rejectUnauthorized: true,
};

if (fs.existsSync(caCertPath)) {
  sslConfig.ca = fs.readFileSync(caCertPath);
} else {
  console.warn(`⚠️ TiDB CA certificate not found at: ${caCertPath}`);
}

const pool = mysql.createPool({
  host: env.TIDB_HOST,
  port: env.TIDB_PORT,
  user: env.TIDB_USER,
  password: env.TIDB_PASSWORD,
  database: env.TIDB_DATABASE,
  ssl: sslConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export const query = async (sql, params = []) => {
  const [rows] = await pool.query(sql, params);
  return rows;
};

export const withTransaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT VERSION() AS version, DATABASE() AS database_name, NOW() AS server_time');
    connection.release();
    console.log('✅ Connected successfully to TiDB Cloud Database!');
    console.log('📊 Database details:', rows[0]);
    return { success: true, info: rows[0] };
  } catch (error) {
    console.error('❌ TiDB Database Connection Error:', error.message);
    return { success: false, error: error.message };
  }
};

export default pool;
