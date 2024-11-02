class AppError extends Error {
  constructor(message: string, statusCode: number) {
    super();
    statusCode = statusCode;
    status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.message = message;

    Error.captureStackTrace(this, this.constructor);
  }
}

export { AppError };
