import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import env from './config/env.js';
import v1Routes from './routes/v1.js';
import legacyApiRoutes from './routes/api.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { ApiError } from './utils/ApiError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security HTTP headers
app.use(helmet({
  contentSecurityPolicy: false, // Allows Swagger UI assets-
}));

// CORS Configuration - Permissive for React Native mobile clients and web dev
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl) or any origin in development
      if (!origin || env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      if (origin === env.CLIENT_URL || origin.startsWith('http://localhost') || origin.startsWith('http://10.') || origin.startsWith('http://192.168.')) {
        return callback(null, true);
      }
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// HTTP Access Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Request Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Swagger Documentation
const swaggerPath = path.resolve(__dirname, '../docs/swagger.json');
if (fs.existsSync(swaggerPath)) {
  const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// Root Route
app.get('/', (req, res) => {
  res.json({
    name: 'CoalMin API Server (SIH26024)',
    status: 'online',
    version: '1.0.0',
    documentation: '/api/docs',
    api_v1: '/api/v1',
    health: '/api/v1/health',
  });
});

// Mount Master API v1 Router
app.use('/api/v1', v1Routes);

// Mount Legacy /api Routes for backwards compatibility
app.use('/api', legacyApiRoutes);

// 404 Route Not Found Handler
app.use((req, res, next) => {
  next(ApiError.notFound(`Endpoint ${req.method} ${req.originalUrl} does not exist`));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
