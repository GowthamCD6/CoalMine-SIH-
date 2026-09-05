import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'CoalMin API service is healthy',
    timestamp: new Date().toISOString()
  });
});

// Database status & query test endpoint
router.get('/db-status', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT VERSION() AS version, DATABASE() AS database_name, NOW() AS server_time');
    res.status(200).json({
      status: 'connected',
      database: 'TiDB Cloud',
      info: rows[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'TiDB Cloud',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Mining stats endpoint placeholder
router.get('/stats', (req, res) => {
  res.status(200).json({
    minesActive: 12,
    productionTodayTons: 4520,
    safetyIncidents: 0,
    operationalEfficiency: '94.8%',
    sensorsOnline: 148,
    timestamp: new Date().toISOString()
  });
});

export default router;

