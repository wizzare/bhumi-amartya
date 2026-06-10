import OpenAI from "openai";

let client: OpenAI | null = null;

if (typeof window === "undefined") {
  client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
  });
}

export default client;
