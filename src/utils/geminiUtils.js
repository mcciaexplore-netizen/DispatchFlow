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

/**
 * Call Gemini with automatic model cascade:
 *   1. Gemini 2.5 Flash  — most capable, tried first
 *   2. Gemini 1.5 Flash  — higher free quota; adds responseMimeType:"application/json"
 *                          to guarantee clean JSON when 2.5 Flash fails or garbles output
 *
 * If both fail, throws the last error received.
 *
 * @param {object} requestBody  - Gemini request body (contents + generationConfig)
 * @param {string} apiKey       - Google Generative AI API key
 * @returns {object}            - Parsed JSON result from Gemini
 */
export async function callGeminiWithFallback(requestBody, apiKey) {
  // ── Primary: Gemini 2.5 Flash ───────────────────────────────────────────
  try {
    const res = await fetchWithRetry(
      `${PRIMARY_URL}?key=${apiKey}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(requestBody) },
      DEFAULT_RETRY_COUNT
    );
    if (res.ok) {
      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      if (rawText) {
        try { return parseGeminiJSON(rawText); } catch (_) {
          // JSON garbled — fall through to 1.5 Flash
          console.warn("[Gemini] 2.5 Flash returned unparseable JSON — retrying with 1.5 Flash");
        }
      }
    } else {
      const err = await res.json().catch(() => ({}));
      const msg = err.error?.message || res.statusText;
      // Only fall through on quota / rate-limit errors
      if (res.status !== 429 && res.status !== 503 && res.status !== 500) {
        throw new Error(`Gemini API error: ${msg}`);
      }
      console.warn(`[Gemini] 2.5 Flash error ${res.status} — retrying with 1.5 Flash`);
    }
  } catch (e) {
    if (e.message.startsWith("Gemini API error")) throw e;
    console.warn("[Gemini] 2.5 Flash network error — retrying with 1.5 Flash", e.message);
  }

  // ── Fallback: Gemini 1.5 Flash with forced JSON output ───────────────────
  const fallbackBody = {
    ...requestBody,
    generationConfig: {
      ...requestBody.generationConfig,
      responseMimeType: "application/json",  // guarantees clean JSON output
    },
  };

  const res2 = await fetchWithRetry(
    `${FALLBACK_URL}?key=${apiKey}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(fallbackBody) },
    DEFAULT_RETRY_COUNT
  );

  if (!res2.ok) {
    const err = await res2.json().catch(() => ({}));
    throw new Error(`Gemini API error: ${err.error?.message || res2.statusText}`);
  }

  const data2 = await res2.json();
  const text2 = data2.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text2) throw new Error("No response from Gemini. Check your API key and try again.");

  return parseGeminiJSON(text2);
}
