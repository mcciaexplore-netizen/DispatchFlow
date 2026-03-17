/**
 * Shared Gemini utilities — imported by geminiOCR.js and invoiceOCR.js.
 * Provides URL constants, robust JSON parsing, and a 2.5→1.5 Flash cascade.
 */
import { fetchWithRetry } from "./retry";
export {
  GEMINI_API_URL, GEMINI_API_URL_FALLBACK,
  GEMINI_MAX_TOKENS, GEMINI_MAX_TOKENS_INVOICE, GEMINI_TEMPERATURE,
} from "./constants";
import {
  GEMINI_API_URL as PRIMARY_URL,
  GEMINI_API_URL_FALLBACK as FALLBACK_URL,
  DEFAULT_RETRY_COUNT,
} from "./constants";

/**
 * Robustly extract a JSON object from Gemini's response text.
 * Handles: direct JSON, markdown fences (```json…```), and leading prose.
 */
export function parseGeminiJSON(text) {
  if (!text || text.trim() === "") {
    throw new Error("Gemini returned an empty response. Please try again.");
  }

  let t = text.trim();

  // 1. Try direct parse (works when responseMimeType:application/json is honored)
  try { return JSON.parse(t); } catch (_) {}

  // 2. Strip markdown code fences:  ```json ... ```  or  ``` ... ```
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) { t = fence[1].trim(); }

  // 3. Try again after fence removal
  try { return JSON.parse(t); } catch (_) {}

  // 4. Extract outermost { … } block to skip leading/trailing prose
  const start = t.indexOf("{");
  const end   = t.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try { return JSON.parse(t.slice(start, end + 1)); } catch (_) {}
  }

  throw new Error("Gemini did not return a valid JSON object. Try a clearer image.");
}

async function callGeminiEndpoint(url, requestBody, retryCount, modelLabel) {
  try {
    const res = await fetchWithRetry(
      url,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(requestBody) },
      retryCount
    );
    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return { ok: true, rawText };
  } catch (err) {
    const status = err?.status ?? err?.statusCode ?? 0;
    let apiMessage = err?.message || "Unknown Gemini error";

    if (err?.response) {
      const body = await err.response.json().catch(() => ({}));
      apiMessage = body?.error?.message || apiMessage;
    }

    return {
      ok: false,
      status,
      message: `[Gemini:${modelLabel}] ${apiMessage}`,
    };
  }
}

/**
 * Call Gemini with automatic model cascade:
 *   1. Gemini 1.5 Flash Latest — stable, tried first
 *   2. Gemini 1.5 Flash         — universal fallback; adds responseMimeType:"application/json"
 *                                 to guarantee clean JSON when primary fails or garbles output
 *
 * If both fail, throws the last error received.
 *
 * @param {object} requestBody  - Gemini request body (contents + generationConfig)
 * @param {string} apiKey       - Google Generative AI API key
 * @param {object} options      - Optional call options (retryCount)
 * @returns {object}            - Parsed JSON result from Gemini
 */
export async function callGeminiWithFallback(requestBody, apiKey, options = {}) {
  const retryCount = Number.isInteger(options.retryCount) && options.retryCount > 0
    ? options.retryCount
    : DEFAULT_RETRY_COUNT;

  const primaryBody = {
    ...requestBody,
    generationConfig: {
      ...requestBody.generationConfig,
      responseMimeType: "application/json",
    },
  };

  // ── Primary model call ────────────────────────────────────────────────────
  const primaryResult = await callGeminiEndpoint(
    `${PRIMARY_URL}?key=${apiKey}`,
    primaryBody,
    retryCount,
    "primary"
  );

  if (primaryResult.ok && primaryResult.rawText) {
    try {
      return parseGeminiJSON(primaryResult.rawText);
    } catch (_) {
      // JSON garbled — fall through to fallback model
      console.warn("[Gemini] Primary model returned unparseable JSON — retrying with fallback model");
    }
  } else if (primaryResult.ok && !primaryResult.rawText) {
    console.warn("[Gemini] Primary model returned empty text — retrying with fallback model");
  } else {
    // Fall through for model-not-found, quota, or transient server errors
    console.warn(`${primaryResult.message} — retrying with fallback model`);
  }

  // ── Fallback: Gemini 1.5 Flash with forced JSON output ───────────────────
  const fallbackBody = {
    ...requestBody,
    generationConfig: {
      ...requestBody.generationConfig,
      responseMimeType: "application/json",  // guarantees clean JSON output
    },
  };

  const fallbackResult = await callGeminiEndpoint(
    `${FALLBACK_URL}?key=${apiKey}`,
    fallbackBody,
    retryCount,
    "fallback"
  );

  if (!fallbackResult.ok) {
    const primaryMsg = primaryResult.ok ? "[Gemini:primary] no usable text response" : primaryResult.message;
    throw new Error(`${primaryMsg}; ${fallbackResult.message}`);
  }

  if (!fallbackResult.rawText) {
    throw new Error("Gemini returned empty text from fallback model. Check API key and model access.");
  }

  return parseGeminiJSON(fallbackResult.rawText);
}
