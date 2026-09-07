export class ApiError extends Error {
  constructor(statusCode, message = 'Something went wrong', details = [], code = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.code = code || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'API_ERROR');
    this.success = false;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg = 'Bad Request', details = [], code = 'BAD_REQUEST') {
    return new ApiError(400, msg, details, code);
  }

  static unauthorized(msg = 'Unauthorized access', details = [], code = 'UNAUTHORIZED') {
    return new ApiError(401, msg, details, code);
  }

  static forbidden(msg = 'Forbidden: insufficient permissions', details = [], code = 'FORBIDDEN') {
    return new ApiError(403, msg, details, code);
  }

  static notFound(msg = 'Resource not found', details = [], code = 'NOT_FOUND') {
    return new ApiError(404, msg, details, code);
  }

  static conflict(msg = 'Resource already exists', details = [], code = 'CONFLICT') {
    return new ApiError(409, msg, details, code);
  }

  static internal(msg = 'Internal server error', details = [], code = 'INTERNAL_SERVER_ERROR') {
    return new ApiError(500, msg, details, code);
  }
}

export default ApiError;
