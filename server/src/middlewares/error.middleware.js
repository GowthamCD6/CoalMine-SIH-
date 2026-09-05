import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';
import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let code = 'INTERNAL_SERVER_ERROR';
  let details = [];

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
    details = err.details || [];
  } else if (err instanceof ZodError || err.name === 'ZodError' || Array.isArray(err.issues)) {
    statusCode = 400;
    message = 'Validation Error';
    code = 'VALIDATION_ERROR';
    const issues = err.issues || err.errors || [];
    details = issues.map((e) => ({
      field: Array.isArray(e.path) ? e.path.join('.') : '',
      message: e.message,
    }));
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
    code = 'INVALID_TOKEN';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired';
    code = 'TOKEN_EXPIRED';
  } else if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
    statusCode = 409;
    message = 'A resource with this unique identifier already exists';
    code = 'DUPLICATE_ENTRY';
    details = [{ message: err.sqlMessage || err.message }];
  } else if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.errno === 1452) {
    statusCode = 400;
    message = 'Referenced resource does not exist (foreign key constraint failure)';
    code = 'FOREIGN_KEY_VIOLATION';
    details = [{ message: err.sqlMessage || err.message }];
  } else if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
    statusCode = 400;
    message = 'Cannot delete or update resource because it is referenced by other records';
    code = 'REFERENCE_CONSTRAINT';
    details = [{ message: err.sqlMessage || err.message }];
  } else if (err.code === 'ER_DATA_TOO_LONG' || err.errno === 1406) {
    statusCode = 400;
    message = 'Data too long for field';
    code = 'DATA_TOO_LONG';
  } else if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
  } else {
    message = err.message || 'Internal Server Error';
  }

  if (statusCode >= 500) {
    logger.error(`[${req.method}] ${req.originalUrl || req.url} - ${message}`, {
      stack: err.stack,
      error: err,
    });
  } else {
    logger.warn(`[${req.method}] ${req.originalUrl || req.url} - ${message}`, {
      code,
      details,
    });
  }

  return res.status(statusCode).json({
    success: false,
    message,
    error: {
      code,
      details,
    },
  });
};

export default errorHandler;
