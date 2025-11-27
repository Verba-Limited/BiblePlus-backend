export default class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}
