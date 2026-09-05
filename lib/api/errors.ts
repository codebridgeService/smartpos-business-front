/**
 * Standardized API Error Handling
 */

export interface ValidationErrorMap {
  [field: string]: string[];
}

export interface ApiErrorPayload {
  message?: string;
  errors?: ValidationErrorMap;
  locked_until?: string;
  [key: string]: unknown;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly errors?: ValidationErrorMap;
  public readonly data?: unknown;

  constructor(status: number, message: string, errors?: ValidationErrorMap, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    this.data = data;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * Check if error is an HTTP 422 Unprocessable Entity (Form Validation error)
   */
  public isValidationError(): boolean {
    return this.status === 422 && Boolean(this.errors && Object.keys(this.errors).length > 0);
  }

  /**
   * Check if error is an HTTP 401 Unauthorized
   */
  public isUnauthorized(): boolean {
    return this.status === 401;
  }

  /**
   * Check if error is an HTTP 403 Forbidden
   */
  public isForbidden(): boolean {
    return this.status === 403;
  }

  /**
   * Check if error is an HTTP 404 Not Found
   */
  public isNotFound(): boolean {
    return this.status === 404;
  }

  /**
   * Returns the first error message for a specific form field, if any.
   */
  public getFieldError(fieldName: string): string | undefined {
    if (!this.errors) return undefined;
    const fieldErrors = this.errors[fieldName];
    return Array.isArray(fieldErrors) && fieldErrors.length > 0 ? fieldErrors[0] : undefined;
  }
}

/**
 * Parses a fetch response and JSON/text payload into a standardized ApiError.
 */
export async function parseApiError(response: Response): Promise<ApiError> {
  const status = response.status;
  let message = `Request failed with status ${status}`;
  let errors: ValidationErrorMap | undefined;
  let data: unknown;

  try {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const json: ApiErrorPayload = await response.json();
      data = json;

      if (typeof json.message === "string" && json.message.trim().length > 0) {
        message = json.message;
      }

      if (json.errors && typeof json.errors === "object") {
        errors = json.errors;
      }
    } else {
      const text = await response.text();
      if (text) {
        message = text;
      }
    }
  } catch {
    // If parsing response body fails, use default message with status
  }

  return new ApiError(status, message, errors, data);
}
