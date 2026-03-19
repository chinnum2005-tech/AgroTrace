import { toast } from './components/Toast';

interface RetryConfig {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  factor?: number;
  shouldRetry?: (error: any) => boolean;
}

const defaultConfig: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  factor: 2,
  shouldRetry: (error) => {
    // Retry on network errors, 5xx errors, and rate limits
    return (
      error.message?.includes('network') ||
      error.message?.includes('timeout') ||
      error.status >= 500 ||
      error.status === 429
    );
  }
};

/**
 * Execute a function with exponential backoff retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    factor = 2,
    shouldRetry = defaultConfig.shouldRetry!
  } = config;

  let lastError: any;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry if shouldn't retry or max retries reached
      if (!shouldRetry(error) || attempt > maxRetries) {
        throw error;
      }

      // Show retry notification
      toast.info(`Attempt ${attempt} failed. Retrying in ${Math.round(delay / 1000)}s...`);

      // Wait before next retry
      await new Promise(resolve => setTimeout(resolve, delay));

      // Calculate next delay with exponential backoff
      delay = Math.min(delay * factor, maxDelay);
    }
  }

  throw lastError;
}

/**
 * Fetch wrapper with automatic retry
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  config?: RetryConfig
): Promise<Response> {
  return withRetry(async () => {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw {
        status: response.status,
        statusText: response.statusText,
        message: `HTTP ${response.status}: ${response.statusText}`
      };
    }
    
    return response;
  }, config);
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: any): boolean {
  return (
    error.message?.includes('network') ||
    error.message?.includes('Failed to fetch') ||
    error.message?.includes('Network request failed')
  );
}

/**
 * Check if error is a server error
 */
export function isServerError(error: any): boolean {
  return error.status >= 500 && error.status < 600;
}

/**
 * Check if error is a rate limit error
 */
export function isRateLimitError(error: any): boolean {
  return error.status === 429;
}
