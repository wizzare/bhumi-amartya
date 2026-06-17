import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const requestedModel = process.env.GEMINI_MODEL;
const modelFallbacks = [
  requestedModel,
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
].filter(Boolean) as string[];

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function generateGeminiText(prompt: string): Promise<string> {
  if (!genAI) {
    throw new Error("Missing GEMINI_API_KEY for server-side AI generation.");
  }

  let lastError: any;
  const maxRetries = 2;

  for (const modelName of modelFallbacks) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[GEMINI CALL] Model: ${modelName}, Attempt: ${attempt + 1}`);
        const model = genAI.getGenerativeModel({
          model: modelName,
        });

        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (error: any) {
        lastError = error;
        const status = error?.status || error?.response?.status;
        const message = error?.message?.toLowerCase() || "";

        // 429 Resource Exhausted or Rate Limit
        if (status === 429 || message.includes("429") || message.includes("resource_exhausted") || message.includes("quota")) {
          console.error(`[GEMINI 429] Quota exceeded on ${modelName}, attempt ${attempt + 1}`);
          if (attempt < maxRetries) {
            const backoff = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
            console.log(`[GEMINI RETRY] Backing off for ${Math.round(backoff)}ms...`);
            await delay(backoff);
            continue; // Retry same model
          }
        }

        // Other errors: break attempt loop and try next model
        console.error(`[GEMINI ERROR] ${modelName}: ${error?.message}`);
        break;
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Gemini generation failed for all configured models and retries.");
}

export async function generateGeminiJson<T>(prompt: string): Promise<T> {
  const text = await generateGeminiText(prompt);
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch (error) {
    console.error("Gemini JSON parse error:", error, cleaned);
    throw new Error("Gemini returned invalid JSON.");
  }
}

export async function generateSoulReflection(prompt: string) {
  return generateGeminiText(prompt);
}
