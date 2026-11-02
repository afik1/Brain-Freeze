import { Request, Response, NextFunction } from "express";
import type { ApiError } from "./types.js";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    const body: ApiError = {
      error: { code: err.code, message: err.message },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  console.error("Unhandled error:", err);
  const body: ApiError = {
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred.",
    },
  };
  res.status(500).json(body);
}
