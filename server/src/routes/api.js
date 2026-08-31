import express from 'express';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'CoalMin API service is healthy',
    timestamp: new Date().toISOString()
  });
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
