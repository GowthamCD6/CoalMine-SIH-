export class ApiResponse {
  constructor(statusCode, data, message = 'Success', meta = null) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
    if (meta) {
      this.meta = meta;
    }
  }

  static success(res, data = null, message = 'OK', statusCode = 200, meta = null) {
    const responseBody = {
      success: true,
      data,
      message,
    };
    if (meta) {
      responseBody.meta = meta;
    }
    return res.status(statusCode).json(responseBody);
  }

  static created(res, data = null, message = 'Created successfully', meta = null) {
    return ApiResponse.success(res, data, message, 201, meta);
  }
}

export default ApiResponse;
