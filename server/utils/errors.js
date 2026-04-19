export class DygError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends DygError {
  constructor(message = 'Invalid data', details = null) {
    super(message, 422, 'VALIDATION_FAILED', details);
  }
}

export class NotFoundError extends DygError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends DygError {
  constructor(message = 'Not authenticated') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends DygError {
  constructor(message = 'Access denied') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class ConflictError extends DygError {
  constructor(message = 'Conflict') {
    super(message, 409, 'CONFLICT');
  }
}

export class IntegrationError extends DygError {
  constructor(message = 'Third-party service error', details = null) {
    super(message, 502, 'INTEGRATION_FAILED', details);
  }
}

// PostgreSQL connection error detection
const PG_UNAVAILABLE = new Set([
  '08000', '08001', '08003', '08004', '08006', '08007',
  '57P01', '57P02', '57P03', '57P04', '57P05'
]);

export function isDbUnavailableError(err) {
  if (!err || typeof err !== 'object') return false;
  const c = err.code;
  if (typeof c === 'string') {
    if (['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET'].includes(c)) return true;
    if (PG_UNAVAILABLE.has(c)) return true;
  }
  return /connection.*(refused|terminated|closed)|timeout/i.test(String(err.message || ''));
}
