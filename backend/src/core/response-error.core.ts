import { StatusCodes } from 'http-status-codes';

export class AppError extends Error {
  status: number;
  code: string | number | Array<unknown>;
  stack?: string;

  constructor(
    message: string,
    status: number,
    code: string | number | Array<unknown> = 'APP_ERROR'
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not Found', code = 'NOT_FOUND') {
    super(message, StatusCodes.NOT_FOUND, code);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', code = 'BAD_REQUEST') {
    super(message, StatusCodes.BAD_REQUEST, code);
  }
}

export class InternalServerError extends AppError {
  constructor(
    message = 'Internal Server Error',
    code = 'INTERNAL_SERVER_ERROR'
  ) {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', code = 'FORBIDDEN') {
    super(message, StatusCodes.FORBIDDEN, code);
  }
}

export class UnAuthorizedError extends AppError {
  constructor(message = 'Unauthorized', code = 'UNAUTHORIZED') {
    super(message, StatusCodes.UNAUTHORIZED, code);
  }
}
