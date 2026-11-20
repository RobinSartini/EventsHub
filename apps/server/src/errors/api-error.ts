import { z } from "zod";

export type ErrorDetails = Record<string, string[]>;

export class ApiError extends Error {
  readonly status: number;
  readonly details?: ErrorDetails;

  constructor(status: number, message: string, details?: ErrorDetails) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    if (details !== undefined) {
      this.details = details;
    }
  }
}

export const badRequest = (message: string, details?: ErrorDetails) =>
  new ApiError(400, message, details);

export const unauthorized = () => new ApiError(401, "Unauthorized");

export const forbidden = () => new ApiError(403, "Forbidden");

export const notFound = (resource: string) => new ApiError(404, `${resource} not found`);

export function validationError(message: string, error: z.ZodError) {
  const { formErrors, fieldErrors } = z.flattenError(error);
  return badRequest(message, {
    ...(fieldErrors as ErrorDetails),
    ...(formErrors.length > 0 && { _form: formErrors }),
  });
}
