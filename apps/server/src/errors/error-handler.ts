import type { Context } from "hono";

import { HTTPException } from "hono/http-exception";

import { ApiError } from "@/errors/api-error";

function errorBody(status: number, error: string, details?: unknown) {
  return { success: false as const, status, error, ...(details !== undefined && { details }) };
}

export function errorHandler(err: Error, c: Context): Response {
  if (err instanceof ApiError) {
    return c.json(errorBody(err.status, err.message, err.details), err.status as 500);
  }
  if (err instanceof HTTPException) {
    return c.json(errorBody(err.status, err.message), err.status);
  }
  console.error("Unhandled error:", err);
  return c.json(errorBody(500, "Internal Server Error"), 500);
}
