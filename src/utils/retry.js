/**
 * Exponential-backoff retry wrapper for any async function.
 *
 * @param {() => Promise<any>} fn        - The async function to call
 * @param {number}             retries   - Max number of attempts (default 3)
 * @param {number}             baseDelay - Initial wait in ms (doubles each attempt)
 */
export async function withRetry(fn, retries = 3, baseDelay = 500) {
  let lastError;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      // Don't retry on client-side errors (bad API key, 400, 403)
      const status = err?.status ?? err?.statusCode ?? 0;
      if (status >= 400 && status < 500) throw err;
      if (attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, baseDelay * 2 ** attempt));
      }
    }
  }
  throw lastError;
}

/**
 * fetch() wrapper with retry. Uses text/plain to avoid CORS preflight.
 */
export async function fetchWithRetry(url, options = {}, retries = 3) {
  return withRetry(async () => {
    const res = await fetch(url, options);
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}: ${res.statusText}`);
      err.status = res.status;
      // Attach response so callers can read the body
      err.response = res;
      throw err;
    }
    return res;
  }, retries);
}
