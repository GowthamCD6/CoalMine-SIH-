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
  maxIdle: 3,                 // Keep idle pool small so dead connections are cleared
  idleTimeout: 30000,         // Cull idle connection after 30s before remote resets it
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

// Suppress unhandled errors on background idle connections in pool
if (pool.pool && typeof pool.pool.on === 'function') {
  pool.pool.on('error', (err) => {
    console.warn('⚠️ [TiDB Pool Warning] Background connection dropped (auto-recovering):', err.code || err.message);
  });
}

const TRANSIENT_ERRORS = new Set([
  'ECONNRESET',
  'PROTOCOL_CONNECTION_LOST',
  'ETIMEDOUT',
  'EPIPE',
  'ENOTFOUND',
  'ER_LOCK_DEADLOCK',
  'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR',
  'ER_QUERY_INTERRUPTED',
  'SERVER_SHUTDOWN',
]);

const isTransientError = (err) => {
  if (!err) return false;
  if (TRANSIENT_ERRORS.has(err.code)) return true;
  if (err.fatal) return true;
  const msg = String(err.message || '');
  return (
    msg.includes('ECONNRESET') ||
    msg.includes('Connection lost') ||
    msg.includes('closed network connection') ||
    msg.includes('deadlock') ||
    msg.includes('ETIMEDOUT')
  );
};

// Resilient wrapper with auto-retry for transient network drops (ECONNRESET)
const originalQuery = pool.query.bind(pool);
const originalExecute = pool.execute.bind(pool);
const originalGetConnection = pool.getConnection.bind(pool);

async function resilientQuery(sql, params = [], maxRetries = 3) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await originalQuery(sql, params);
    } catch (error) {
      attempt++;
      if (attempt < maxRetries && isTransientError(error)) {
        const backoff = attempt * 300;
        console.warn(
          `⚠️ [TiDB] Transient error (${error.code || error.message}). Retrying query attempt ${attempt}/${maxRetries} in ${backoff}ms...`
        );
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }
      throw error;
    }
  }
}

async function resilientExecute(sql, params = [], maxRetries = 3) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await originalExecute(sql, params);
    } catch (error) {
      attempt++;
      if (attempt < maxRetries && isTransientError(error)) {
        const backoff = attempt * 300;
        console.warn(
          `⚠️ [TiDB] Transient error (${error.code || error.message}). Retrying execute attempt ${attempt}/${maxRetries} in ${backoff}ms...`
        );
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }
      throw error;
    }
  }
}

async function resilientGetConnection(maxRetries = 3) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await originalGetConnection();
    } catch (error) {
      attempt++;
      if (attempt < maxRetries && isTransientError(error)) {
        const backoff = attempt * 300;
        console.warn(
          `⚠️ [TiDB] Transient error getting connection (${error.code || error.message}). Retrying attempt ${attempt}/${maxRetries}...`
        );
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }
      throw error;
    }
  }
}

// Monkey-patch pool methods so all repositories importing `db` benefit automatically
pool.query = resilientQuery;
pool.execute = resilientExecute;
pool.getConnection = resilientGetConnection;

export const query = async (sql, params = []) => {
  const [rows] = await resilientQuery(sql, params);
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
