import app from './app.js';
import env from './config/env.js';
import { testConnection } from './config/db.js';
import logger from './utils/logger.js';

const PORT = env.PORT || 5000;

const startServer = async () => {
  try {
    const dbTest = await testConnection();
    if (!dbTest.success) {
      logger.warn('⚠️ Server is starting with database connection issues. Check network/credentials.');
    }

    const server = app.listen(PORT, () => {
      logger.info(`🚀 CoalMin API Server running at http://localhost:${PORT}`);
      logger.info(`📚 Swagger Documentation available at http://localhost:${PORT}/api/docs`);
      logger.info(`🩺 Health Check endpoint at http://localhost:${PORT}/api/v1/health`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`❌ Port ${PORT} is already in use by another process!`);
        logger.error(`👉 To free port ${PORT}, run in your terminal: npx kill-port ${PORT}`);
        logger.error(`👉 Or change PORT in .env (e.g. PORT=5001)`);
      } else {
        logger.error('Server encountered an error:', err);
      }
      process.exit(1);
    });

    const gracefulShutdown = (signal) => {
      logger.info(`Received ${signal}. Shutting down server gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('unhandledRejection', (reason) => {
      logger.error('⚠️ [Server Process] Unhandled Promise Rejection (auto-recovered):', reason);
    });

    process.on('uncaughtException', (err) => {
      logger.error('⚠️ [Server Process] Uncaught Exception (auto-recovered):', err);
    });

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
