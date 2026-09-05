import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve CA certificate path relative to server root
const caCertPath = process.env.TIDB_CA_PATH
  ? path.resolve(__dirname, '../../', process.env.TIDB_CA_PATH)
  : path.resolve(__dirname, '../../cert/isrgrootx1.pem');

let sslConfig = {
  minVersion: 'TLSv1.2',
  rejectUnauthorized: true,
};

if (fs.existsSync(caCertPath)) {
  sslConfig.ca = fs.readFileSync(caCertPath);
} else {
  console.warn(`⚠️ TiDB CA certificate not found at: ${caCertPath}`);
}

const pool = mysql.createPool({
  host: process.env.TIDB_HOST,
  port: parseInt(process.env.TIDB_PORT || '4000', 10),
  user: process.env.TIDB_USER,
  password: process.env.TIDB_PASSWORD,
  database: process.env.TIDB_DATABASE || 'sys',
  ssl: sslConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

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
