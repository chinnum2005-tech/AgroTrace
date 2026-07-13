import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  errorData?: any;

  constructor(message: string, statusCode: number, errorData?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errorData = errorData;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      serverData: err.errorData,
    });
  }

  console.error('ERROR:', err);

  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
  });
};
